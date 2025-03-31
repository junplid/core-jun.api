import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { CreateNewTicketDTO_I } from "./DTO";
import { LibWebSocketHumanService } from "../../libs/WebSocket/humanService";
import {
  CacheStateUserSocket,
  cacheSocketHumanServiceUsers,
} from "../../infra/websocket/cache";
import { replaceVariablePlaceholders } from "../../helpers/replaceVariablePlaceholders";
import { ErrorResponse } from "../../utils/ErrorResponse";

function getRandomNumber(min: number, max: number) {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const uniqueProtocol = async () =>
  new Promise<string>((res) => {
    const protocol = getRandomNumber(10000000, 99999999);
    const checkProtocol = async (protocol: string) => {
      const getProtocol = await prisma.tickets.findFirst({
        where: { protocol },
      });
      if (getProtocol) {
        checkProtocol(getRandomNumber(10000000, 99999999));
      } else {
        res(protocol);
      }
    };
    checkProtocol(protocol);
  });

interface EmitNotifyToastMessage {
  attendantId: number;
  ticketId: number;
  message: string;
  type: "error";
}

export class CreateNewTicketUseCase {
  constructor() {}

  async run({ number, ...dto }: CreateNewTicketDTO_I) {
    let admData: {
      allowStartingNewTicket: boolean;
      accountId: number;
      sectorsId?: number;
      sectorName?: string;
      previewPhone?: boolean;
      businessId: number;
      businessName: string;
    } | null = null;
    const accountAttendant = await prisma.sectorsAttendants.findFirst({
      where: { id: dto.userId },
      select: {
        accountId: true,
        allowStartingNewTicket: true,
        Business: {
          select: { id: true, name: true },
        },
        Sectors: {
          select: { id: true, previewPhone: true, name: true },
        },
      },
    });

    if (accountAttendant) {
      const { Sectors, Business, ...rest } = accountAttendant;
      admData = {
        ...rest,
        businessId: Business.id,
        businessName: Business.name,
        sectorsId: Sectors?.id,
        sectorName: Sectors?.name,
      };
    }

    if (!admData || !admData.sectorsId) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado`,
        type: "error",
      });
    }

    const libSocketHumanService = new LibWebSocketHumanService(
      admData.businessId
    );
    const botWA = sessionsBaileysWA.get(dto.connectionId);
    const statusConnection = botWA?.ev.emit("connection.update", {
      connection: "open",
    });
    if (!botWA || (botWA && !statusConnection)) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Não foi possivel conclir a mensagem, conexão offline",
      });
      throw new ErrorResponse(400).input({
        path: "connectionId",
        text: `Não possivel enviar mensagem para uma conexão offline`,
      });
    }

    let numberWhatsAppValid: null | string = null;

    const isExistOnWhatsApp = await botWA.onWhatsApp(
      dto.completeNumber + "@s.whatsapp.net"
    );
    if (isExistOnWhatsApp?.length && isExistOnWhatsApp[0]?.exists) {
      numberWhatsAppValid = isExistOnWhatsApp[0].jid.replace(
        "@s.whatsapp.net",
        ""
      );
    }

    if (!numberWhatsAppValid) {
      throw new ErrorResponse(400).input({
        path: "completeNumber",
        text: `Número inválido ou não está no whatsapp`,
      });
    }

    const { ContactsWAOnAccount, ...contactWA } =
      await prisma.contactsWA.upsert({
        where: { completeNumber: numberWhatsAppValid },
        create: {
          completeNumber: numberWhatsAppValid,
          ContactsWAOnAccount: {
            create: {
              accountId: admData.accountId,
              name: dto.name,
            },
          },
        },
        update: {},
        select: {
          id: true,
          img: true,
          ContactsWAOnAccount: {
            where: { accountId: admData.accountId },
            select: { id: true },
          },
        },
      });

    if (!ContactsWAOnAccount.length) {
      const { id } = await prisma.contactsWAOnAccount.create({
        data: {
          name: dto.name ?? "SEM NOME",
          accountId: admData.accountId,
          contactWAId: contactWA.id,
        },
        select: { id: true },
      });
      ContactsWAOnAccount.push({ id });
    }

    if (!admData.allowStartingNewTicket) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Não autorizado a iniciar novos tickets",
      });
      throw new ErrorResponse(400).toast({
        title: `Não autorizado a Iniciar Tickets`,
        type: "error",
      });
    }

    const jidLead = numberWhatsAppValid + "@s.whatsapp.net";

    const ticketExists = await prisma.tickets.findFirst({
      where: {
        status: { in: ["open", "new"] },
        ContactsWAOnAccount: {
          ContactsWA: { completeNumber: numberWhatsAppValid },
        },
        ConnectionOnBusiness: { id: dto.connectionId },
      },
      select: { id: true },
    });

    if (ticketExists) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Já existe um ticket com essa conexão para esse número",
      });
      throw new ErrorResponse(400).input({
        path: "connectionId",
        text: `Já existe um ticket para essa conexão para esse número`,
      });
    }

    const protocol = await uniqueProtocol();

    const lastSequence = await prisma.stepsFunnelKanbanOnTickets.findFirst({
      where: { stepsFunnelKanbanId: dto.columnId, Tickets: { status: "open" } },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });

    const ticketSequence = lastSequence ? lastSequence.sequence + 1 : 1;

    const { id, Business, Sectors, SectorsAttendants } =
      await prisma.tickets.create({
        data: {
          status: "open",
          contactsWAOnAccountId: ContactsWAOnAccount[0].id,
          destination: "attendant",
          protocol,
          businessId: admData.businessId,
          sectorsId: admData.sectorsId,
          connectionId: dto.connectionId,
          sectorsAttendantsId: dto.userId,
          destinationSectorsAttendantsId: dto.userId,
          StepsFunnelKanbanOnTickets: {
            create: {
              StepsFunnelKanban: { connect: { id: dto.columnId } },
              sequence: ticketSequence,
            },
          },
        },
        select: {
          SectorsAttendants: { select: { name: true, id: true, office: true } },
          id: true,
          Sectors: {
            select: {
              funnelKanbanId: true,
              name: true,
              SectorsMessages: { select: { messageWelcome: true } },
              signAttendant: true,
              signBusiness: true,
              signSector: true,
            },
          },
          Business: { select: { id: true, name: true } },
        },
      });

    let alreadyExistsHSCWA =
      await prisma.humanServiceOnBusinessOnContactsWAOnAccount.findFirst({
        where: {
          contactsWAOnAccountId: ContactsWAOnAccount[0].id,
          businessId: admData.businessId,
        },
      });
    if (!alreadyExistsHSCWA) {
      alreadyExistsHSCWA =
        await prisma.humanServiceOnBusinessOnContactsWAOnAccount.create({
          data: {
            businessId: admData.businessId,
            contactsWAOnAccountId: ContactsWAOnAccount[0].id,
          },
        });
    }

    const profilePicUrl = await botWA
      .profilePictureUrl(jidLead)
      .then((s) => s)
      .catch(() => undefined);

    try {
      await prisma.contactsWA.update({
        where: { completeNumber: numberWhatsAppValid },
        data: { img: profilePicUrl },
      });
    } catch (error) {
      console.log(error);
    }

    let signature = "";
    if (Sectors.signBusiness) signature += `*${Business.name}*\n`;
    if (Sectors.signSector) signature += `Setor: *${Sectors.name}*\n`;
    if (Sectors.signAttendant) {
      signature += `${SectorsAttendants!.office}: *${
        SectorsAttendants!.name
      }*\n`;
    }

    const nextText = await replaceVariablePlaceholders(dto.text).ah(id);

    const message = await botWA.sendMessage(jidLead, {
      text: `${signature}${nextText}`,
    });

    if (message) {
      await prisma.conversationTickes.create({
        data: {
          message: nextText,
          sentBy: "attendant",
          type: "text",
          ticketsId: id,
          messageKey: message.key.id,
        },
        select: { createAt: true, id: true },
      });
      // const businessNamespace = socketIo.of(
      //   `/business-${Business.id}/human-service`
      // );

      // const objSocket = {
      //   protocol,
      //   businessName: Business.name,
      //   sectorId: admData.sectorsId,
      // };

      libSocketHumanService.AddCardTicket(id, { forceOpen: true });
      // verifica se está com a página de kanban linkada
      const stateUserHumanServide = CacheStateUserSocket.get(dto.userId);
      if (stateUserHumanServide) {
        if (
          !stateUserHumanServide.isMobile &&
          stateUserHumanServide.linkedPages.includes("/kanban")
        ) {
          libSocketHumanService.InsertTicketInKanbanColumn(id);
        }
      }
    } else {
      await prisma.tickets.delete({ where: { id } });
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Não foi possivel enviar a mensagem. Ticket deletado!",
      });
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel enviar a mensagem. Ticket deletado!`,
        type: "error",
      });
    }

    // businessNamespace.emit("synchronize-ticket", {
    //   id,
    //   action: "new",
    //   contactName: ContactsWAOnAccount.name,
    //   destination: "attendant",
    //   contactNumber: ContactsWAOnAccount.ContactsWA.completeNumber,
    //   sectorName: Sectors.name,
    //   sectorAttendantDestinationId: dto.userId,
    //   ...objSocket,
    // });

    return { message: "Ticket criado com sucesso!", status: 200 };
  }
}

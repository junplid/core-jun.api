import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { CreateTransferTicketDTO_I } from "./DTO";
import { LibWebSocketHumanService } from "../../libs/WebSocket/humanService";
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

export class CreateTransferTicketUseCase {
  constructor() {}

  async run(dto: CreateTransferTicketDTO_I) {
    const attendantData = await prisma.sectorsAttendants.findFirst({
      where: { id: dto.userId },
      select: {
        accountId: true,
        Business: { select: { id: true, name: true } },
        Sectors: {
          select: {
            id: true,
            previewPhone: true,
            SectorsMessages: {
              select: { messageTransferTicket: true },
            },
            name: true,
          },
        },
      },
    });

    if (!attendantData) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    if (!attendantData.Sectors) {
      throw new ErrorResponse(401).toast({
        title: `Não autorizado!`,
        type: "error",
      });
    }

    const libSocketHumanService = new LibWebSocketHumanService(
      attendantData.Business.id
    );

    const ticketExists = await prisma.tickets.findFirst({
      where: { id: dto.ticketId, deleted: false },
      select: {
        id: true,
        status: true,
        sectorsId: true,
        connectionId: true,
        sectorsAttendantsId: true,
        ContactsWAOnAccount: {
          select: {
            id: true,
            ContactsWA: { select: { completeNumber: true, id: true } },
          },
        },
      },
    });

    if (!ticketExists) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Ticket não foi encontrado",
        autoClose: 3200,
      });
      throw new ErrorResponse(400).toast({
        title: `Ticket não foi encontrado!`,
        type: "error",
      });
    }

    if (
      ticketExists.status !== "open" ||
      ticketExists.sectorsAttendantsId !== dto.userId
    ) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message:
          "Você só pode transferir os seus tickets que estão abertos/atendendo",
        autoClose: 4300,
      });
      throw new ErrorResponse(400).toast({
        title: `Você só pode transferir os seus tickets que estão abertos/atendendo!`,
        type: "error",
      });
    }

    if (dto.type === "attendant" && dto.userId === dto.attendantId) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Você não pode transferir tickets para você mesmo",
        autoClose: 4300,
      });
      throw new ErrorResponse(400).toast({
        title: `Você não pode transferir tickets para você mesmo!`,
        type: "error",
      });
    }

    const jidLead =
      ticketExists.ContactsWAOnAccount.ContactsWA.completeNumber +
      "@s.whatsapp.net";

    const connection = sessionsBaileysWA.get(ticketExists.connectionId);
    if (!connection) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message:
          "Não foi possivel transferir ticket, a conexão usada nesse ticket está desativada",
        autoClose: 3200,
      });
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel transferir ticket, a conexão usada nesse ticket está desativada!`,
        type: "error",
      });
    }

    const statusConnection = connection.ev.emit("connection.update", {
      connection: "open",
    });

    if (!statusConnection) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Não foi possivel transferir ticket, conexão desativada",
      });
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel transferir ticket, conexão desativada!`,
        type: "error",
      });
    }

    const profilePicUrl = await connection
      .profilePictureUrl(jidLead)
      .then((s) => s)
      .catch(() => undefined);

    await prisma.contactsWA.update({
      where: { id: ticketExists.ContactsWAOnAccount.ContactsWA.id },
      data: { img: profilePicUrl },
    });

    if (attendantData.Sectors.SectorsMessages?.messageTransferTicket) {
      const message = await connection.sendMessage(jidLead, {
        text: attendantData.Sectors.SectorsMessages.messageTransferTicket,
      });
      if (message) {
        await prisma.conversationTickes.create({
          data: {
            message:
              attendantData.Sectors.SectorsMessages.messageTransferTicket,
            sentBy: "attendant",
            type: "text",
            ticketsId: dto.ticketId,
            messageKey: message.key.id,
          },
          select: { createAt: true, id: true },
        });

        const lastSequence = await prisma.stepsFunnelKanbanOnTickets.findFirst({
          where: {
            stepsFunnelKanbanId: dto.columnId,
            Tickets: { status: "open" },
          },
          orderBy: { sequence: "desc" },
          select: { sequence: true, stepsFunnelKanbanId: true },
        });

        if (!lastSequence) {
          libSocketHumanService.NotifyToastMessage({
            type: "error",
            attendantId: dto.userId,
            message: "Coluna do funil kanban não encontrada!",
          });
          throw new ErrorResponse(400).input({
            path: "columnId",
            text: `Coluna do funil kanban não encontrada!`,
          });
        }

        const ticketSequence = lastSequence ? lastSequence.sequence + 1 : 1;

        // atualiza o novo kanban e coluna que o ticket foi transferido
        await prisma.tickets.update({
          where: { id: dto.ticketId },
          data: {
            status: "new",
            sectorsAttendantsId: null,
            sectorsId: dto.sectorId,
            ...(dto.type === "attendant" && {
              destination: "attendant",
              sectorsAttendantsId: dto.attendantId,
              destinationSectorsAttendantsId: dto.attendantId,
            }),
            StepsFunnelKanbanOnTickets: {
              update: {
                where: { ticketsId: dto.ticketId },
                data: {
                  sequence: ticketSequence,
                  stepsFunnelKanbanId: lastSequence.stepsFunnelKanbanId,
                },
              },
            },
          },
        });

        // const businessNamespace = socketIo.of(
        //   `/business-${Business.id}/human-service`
        // );

        // const objSocket = {
        //   protocol,
        //   businessName: Business.name,
        //   sectorId: admData.sectorsId,
        // };

        // businessNamespace.emit("insert-ticket-in-kanban-column", {
        //   ...objSocket,
        //   kanbanId: Sectors.funnelKanbanId!,
        //   columnId: dto.columnId,
        //   sequence: ticketSequence,
        //   ticketId: id,
        //   sectorName: Sectors.name,
        //   sectorAttendantDestinationId: dto.userId,
        //   destination: "attendant",
        //   lead: { pushName: ContactsWAOnAccount.name },
        //   createAt: createAt,
        //   ...(SectorsAttendants && { attendants: SectorsAttendants }),
        // });

        libSocketHumanService.AddCardTicket(dto.ticketId, { forceOpen: true });
        return { message: "Ticket transferido com sucesso!", status: 200 };
      } else {
        libSocketHumanService.NotifyToastMessage({
          type: "error",
          attendantId: dto.userId,
          message:
            "Não foi possivel enviar a mensagem. Ticket não foi transferido!",
        });
        throw new ErrorResponse(400).toast({
          title: `Não foi possivel enviar a mensagem. Ticket não foi transferido!`,
          type: "error",
        });
      }
    }

    const lastSequence = await prisma.stepsFunnelKanbanOnTickets.findFirst({
      where: {
        stepsFunnelKanbanId: dto.columnId,
        Tickets: { status: "open" },
      },
      orderBy: { sequence: "desc" },
      select: { sequence: true, stepsFunnelKanbanId: true },
    });

    if (!lastSequence) {
      libSocketHumanService.NotifyToastMessage({
        type: "error",
        attendantId: dto.userId,
        message: "Coluna do funil kanban não encontrada!",
      });
      throw new ErrorResponse(400).input({
        path: "columnId",
        text: `Coluna do funil kanban não encontrada!`,
      });
    }

    const ticketSequence = lastSequence ? lastSequence.sequence + 1 : 1;

    // atualiza o novo kanban e coluna que o ticket foi transferido
    await prisma.tickets.update({
      where: { id: dto.ticketId },
      data: {
        status: "new",
        sectorsAttendantsId: null,
        sectorsId: dto.sectorId,
        ...(dto.type === "attendant" && {
          destination: "attendant",
          sectorsAttendantsId: dto.attendantId,
          destinationSectorsAttendantsId: dto.attendantId,
        }),
        StepsFunnelKanbanOnTickets: {
          update: {
            where: { ticketsId: dto.ticketId },
            data: {
              sequence: ticketSequence,
              stepsFunnelKanbanId: lastSequence.stepsFunnelKanbanId,
            },
          },
        },
      },
    });

    libSocketHumanService.AddCardTicket(dto.ticketId, { forceOpen: true });
    return { message: "Ticket transferido com sucesso!", status: 200 };
  }
}

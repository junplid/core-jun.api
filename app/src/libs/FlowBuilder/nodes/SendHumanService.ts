import { prisma } from "../../../adapters/Prisma/client";
import { socketIo } from "../../../infra/express";
import { NodeSendHumanServiceData } from "../Payload";
import { LibWebSocketHumanService } from "../../WebSocket/humanService";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

interface PropsNodeSendHumanService {
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeSendHumanServiceData;
  nodeId: string;
}

function getRandomNumber(min: number, max: number) {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export const NodeSendHumanService = (
  props: PropsNodeSendHumanService
): Promise<void> => {
  return new Promise(async (res, rej) => {
    const infoConnection = await prisma.connectionOnBusiness.findUnique({
      where: { id: props.connectionWhatsId },
      select: { number: true },
    });

    if (!infoConnection || !infoConnection.number)
      return rej("connection not found");

    const uniqueProtocol: string = await new Promise<string>((res) => {
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

    const lastSequence = await prisma.stepsFunnelKanbanOnTickets.findFirst({
      where: {
        stepsFunnelKanbanId: props.data.columnId,
        Tickets: { status: "open" },
      },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });
    const ticketSequence = lastSequence ? lastSequence.sequence + 1 : 1;

    const { id, Business, ContactsWAOnAccount, Sectors } =
      await prisma.tickets.create({
        data: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          destination: props.data.destination,
          protocol: uniqueProtocol,
          businessId: props.data.businessId,
          sectorsId: props.data.sectorId,
          connectionId: props.connectionWhatsId,
          ...(props.data.destination === "attendant" && {
            destinationSectorsAttendantsId: props.data.attendantId,
          }),
          StepsFunnelKanbanOnTickets: {
            create: {
              StepsFunnelKanban: { connect: { id: props.data.columnId } },
              sequence: ticketSequence,
            },
          },
        },
        select: {
          id: true,
          Sectors: {
            select: {
              funnelKanbanId: true,
              name: true,
              SectorsMessages: { select: { messageWelcome: true } },
            },
          },
          Business: { select: { id: true, name: true, accountId: true } },
          ContactsWAOnAccount: {
            select: {
              name: true,
              ContactsWA: { select: { completeNumber: true } },
            },
          },
        },
      });
    const alreadyExistsHSCWA =
      await prisma.humanServiceOnBusinessOnContactsWAOnAccount.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          businessId: Business.id,
        },
      });
    if (!alreadyExistsHSCWA) {
      await prisma.humanServiceOnBusinessOnContactsWAOnAccount.create({
        data: {
          businessId: Business.id,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
        },
      });
    }
    if (Sectors.SectorsMessages?.messageWelcome) {
      try {
        const message = await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: Sectors.SectorsMessages.messageWelcome,
          toNumber:
            ContactsWAOnAccount.ContactsWA.completeNumber.replace("+", "") +
            "@s.whatsapp.net",
        });

        if (message) {
          await prisma.conversationTickes.create({
            data: {
              message: Sectors.SectorsMessages.messageWelcome,
              sentBy: "system",
              type: "text",
              ticketsId: id,
              messageKey: message.key.id,
            },
            select: { createAt: true, id: true },
          });
        }
      } catch (error) {
        return rej();
      }
    }

    // cria a variavel e liga no negocio
    const varr = await prisma.variable.findFirst({
      where: {
        VariableOnBusiness: { some: { businessId: props.data.businessId } },
        name: "NOME_LEAD_PERSONALIZADO_AH",
      },
      select: { id: true, VariableOnBusiness: { select: { id: true } } },
    });

    if (!varr) {
      await prisma.variable.create({
        data: {
          name: "NOME_LEAD_PERSONALIZADO_AH",
          type: "dynamics",
          accountId: Business.accountId,
          VariableOnBusiness: { create: { businessId: props.data.businessId } },
        },
      });
    } else if (!varr.VariableOnBusiness.length) {
      await prisma.variableOnBusiness.create({
        data: { businessId: props.data.businessId, variableId: varr.id },
      });
    }

    const libSocketHumanService = new LibWebSocketHumanService(Business.id);
    libSocketHumanService.AddCardTicket(id, { forceOpen: false });

    socketIo
      .of(`/business-${Business.id}/human-service`)
      .emit("notify-toast-new_ticket", {
        destination: props.data.destination,
        sectorId: props.data.sectorId,
        ...(props.data.destination === "attendant" && {
          attendantId: props.data.attendantId,
        }),
      });

    return res();
  });
};

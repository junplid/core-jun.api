import { Namespace } from "socket.io";
import { socketIo } from "../../infra/express";
import { TypeDestinationTicket, TypeStatusTicket } from "@prisma/client";
import { prisma } from "../../adapters/Prisma/client";

type TSteps = "all" | "serving" | "unread" | "new" | "pending" | "resolved";

interface CardTicket {
  id: number;
  status: TypeStatusTicket;
  destination: TypeDestinationTicket;
  sectorId: number;
  color?: string;
  insertSteps: TSteps[];
  content: {
    contactName: string;
    contactImg: string;
    sectorName: string;
    businessName: string;
    countUnreadMsg: number;
    lastMsg?: { value: string; date: Date };
  };
  attendantId?: number;
  forceOpen: boolean;
}

interface IAddCardTicketOptions {
  /**
   * Caso o ticket esteja anexado a um atendente,
   * será forçado a abertura do chat na tela do
   * atendente
   */
  forceOpen: boolean;
}

interface NotifyToastMessage {
  attendantId: number;
  ticketId?: number;
  message: string;
  type: "error";
  autoClose?: number;
  // isso ainda não tá implementado
  sound?: boolean;
}

interface CardTicketKanban {
  id: number;
  kanbanId: number;
  columnId: number;
  attendant: { id: number; name: string; office: string | null };
  hasPendencie: boolean;
  content: {
    protocol: string;
    contactName: string;
    contactImg: string;
    contactNumber: string;
    sectorName: string;
    businessName: string;
    countUnreadMsg: number;
    lastMsg?: { value: string; date: Date };
  };
  sequence: number;
}

export class LibWebSocketHumanService {
  private nameSpace: Namespace;

  constructor(businessId: number) {
    this.nameSpace = socketIo.of(`/business-${businessId}/human-service`);
  }

  public async AddCardTicket(id: number, props: IAddCardTicketOptions) {
    const ticket = await prisma.tickets.findUnique({
      where: { id, deleted: false },
      select: {
        status: true,
        destination: true,
        Business: { select: { name: true } },
        Sectors: { select: { name: true, previewPhone: true, id: true } },
        _count: {
          select: {
            ConversationTickes: { where: { sentBy: "lead", read: false } },
          },
        },
        ConversationTickes: {
          // where: { sentBy: "lead" },
          orderBy: { id: "desc" },
          take: 1,
          select: { type: true, message: true, createAt: true, read: true },
        },
        ContactsWAOnAccount: {
          select: {
            HumanServiceOnBusinessOnContactsWAOnAccount: {
              select: {
                _count: {
                  select: {
                    HumanServiceReportLead: {
                      where: { type: "pendency" },
                    },
                  },
                },
              },
            },
            name: true,
            ContactsWA: { select: { img: true } },
          },
        },
        SectorsAttendants: { select: { id: true } },
      },
    });

    if (!ticket) return false;

    let { ContactsWA, name } = ticket.ContactsWAOnAccount;

    const steps: TSteps[] = ["all"];
    const hasConversation = !!ticket.ConversationTickes.length;
    if (ticket.SectorsAttendants?.id) {
      if (ticket.status === "open") steps.push("serving");
      if (ticket.status === "resolved") steps.push("resolved");
      if (hasConversation && !ticket.ConversationTickes[0].read)
        steps.push("unread");
    }
    if (ticket.status === "new") steps.push("pending");

    const data: CardTicket = {
      id,
      insertSteps: steps,
      destination: ticket.destination,
      sectorId: ticket.Sectors.id,
      status: ticket.status,
      ...(ticket.status === "new" && {
        color: "#ffc107",
      }),
      ...(ticket.status === "open" && {
        color: "#28a745",
      }),
      ...(ticket._count.ConversationTickes && {
        color: "#dc3545",
      }),
      ...(ticket.ContactsWAOnAccount.HumanServiceOnBusinessOnContactsWAOnAccount
        ?._count.HumanServiceReportLead && {
        color: "#fd7e14",
      }),
      ...(ticket.status === "resolved" && {
        color: "#007bff",
      }),
      content: {
        contactName: name,
        contactImg: ContactsWA.img,
        sectorName: ticket.Sectors.name,
        businessName: ticket.Business.name,
        countUnreadMsg: ticket._count.ConversationTickes,
        ...(hasConversation && {
          lastMsg: {
            value: "🎤📷 Arquivo de midia",
            ...(ticket.ConversationTickes[0].type === "text" && {
              value: ticket.ConversationTickes[0].message,
            }),
            date: ticket.ConversationTickes[0].createAt,
          },
        }),
      },
      attendantId: ticket.SectorsAttendants?.id,
      forceOpen: ticket.SectorsAttendants?.id ? !!props.forceOpen : false,
    };

    return this.nameSpace.emit("add-card-ticket", data);
  }

  public async InsertTicketInKanbanColumn(id: number) {
    const ticket = await prisma.tickets.findUnique({
      where: { id, deleted: false, status: "open" },
      select: {
        status: true,
        protocol: true,
        Business: { select: { name: true } },
        Sectors: { select: { name: true, previewPhone: true, id: true } },
        StepsFunnelKanbanOnTickets: {
          select: {
            sequence: true,
            StepsFunnelKanban: { select: { funnelKanbanId: true, id: true } },
          },
        },
        _count: {
          select: {
            ConversationTickes: { where: { sentBy: "lead", read: false } },
          },
        },
        ConversationTickes: {
          // where: { sentBy: "lead" },
          orderBy: { id: "desc" },
          take: 1,
          select: { type: true, message: true, createAt: true, read: true },
        },
        ContactsWAOnAccount: {
          select: {
            HumanServiceOnBusinessOnContactsWAOnAccount: {
              select: {
                _count: {
                  select: {
                    HumanServiceReportLead: {
                      where: { type: "pendency" },
                    },
                  },
                },
              },
            },
            name: true,
            ContactsWA: { select: { img: true, completeNumber: true } },
          },
        },
        SectorsAttendants: { select: { id: true, name: true, office: true } },
      },
    });

    if (!ticket) return false;

    const hasPendencie =
      !!ticket.ContactsWAOnAccount.HumanServiceOnBusinessOnContactsWAOnAccount
        ?._count.HumanServiceReportLead || 0;

    const data: CardTicketKanban = {
      attendant: ticket.SectorsAttendants!,
      columnId: ticket.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.id,
      kanbanId:
        ticket.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.funnelKanbanId,
      hasPendencie:
        !!ticket.ContactsWAOnAccount.HumanServiceOnBusinessOnContactsWAOnAccount
          ?._count.HumanServiceReportLead,
      id,
      sequence: ticket.StepsFunnelKanbanOnTickets[0].sequence,
      content: {
        ...(ticket.status === "new" && {
          color: "#ffc107",
        }),
        ...(ticket.status === "open" && {
          color: "#28a745",
        }),
        ...(ticket._count.ConversationTickes && {
          color: "#dc3545",
        }),
        ...(hasPendencie && {
          color: "#fd7e14",
        }),
        ...(ticket.status === "resolved" && {
          color: "#007bff",
        }),
        protocol: ticket.protocol,
        businessName: ticket.Business.name,
        contactImg: ticket.ContactsWAOnAccount.ContactsWA.img,
        contactName: ticket.ContactsWAOnAccount.name,
        contactNumber: ticket.ContactsWAOnAccount.ContactsWA.completeNumber,
        sectorName: ticket.Sectors.name,
        countUnreadMsg: ticket._count.ConversationTickes,
        ...(ticket.ConversationTickes.length && {
          lastMsg: {
            value: "🎤📷 Arquivo de midia",
            ...(ticket.ConversationTickes[0].type === "text" && {
              value: ticket.ConversationTickes[0].message,
            }),
            date: ticket.ConversationTickes[0].createAt,
          },
        }),
      },
    };

    this.nameSpace.emit("insert-ticket-in-kanban-column", data);
  }

  public NotifyToastMessage({ autoClose = 2100, ...data }: NotifyToastMessage) {
    return this.nameSpace.emit("notify-toast-message", { ...data, autoClose });
  }

  public DeleteTicket(id: number) {
    this.nameSpace.emit("synchronize-ticket", {
      action: "delete",
      ticketId: id,
    });
  }
}

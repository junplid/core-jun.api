import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetFunnelKanbanRepository_I, ResultGet } from "./Repository";

export class GetFunnelKanbanImplementation
  implements GetFunnelKanbanRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async get(props: {
    userId: number;
    sectorId: number;
  }): Promise<ResultGet | null> {
    try {
      const data = await this.prisma.funnelKanban.findFirst({
        where: {
          Sectors: {
            some: {
              id: props.sectorId,
              OR: [
                {
                  SectorsAttendants: {
                    some: { id: props.userId, status: true },
                  },
                },
                { supervisorsId: props.userId },
              ],
            },
          },
        },
        select: {
          id: true,
          StepsFunnelKanban: {
            select: {
              name: true,
              id: true,
              sequence: true,
              color: true,
              StepsFunnelKanbanOnTickets: {
                orderBy: { sequence: "asc" },
                where: {
                  Tickets: {
                    deleted: false,
                    sectorsAttendantsId: props.userId,
                    status: "open",
                  },
                },
                select: {
                  sequence: true,
                  ticketsId: true,
                  Tickets: {
                    select: {
                      protocol: true,
                      Sectors: { select: { name: true } },
                      Business: { select: { name: true } },
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
                          ContactsWA: {
                            select: { completeNumber: true, img: true },
                          },
                        },
                      },
                      destination: true,
                      id: true,
                      status: true,
                      SectorsAttendants: {
                        select: { name: true, id: true, office: true },
                      },
                      _count: {
                        select: {
                          ConversationTickes: {
                            where: { read: false, sentBy: "lead" },
                          },
                        },
                      },
                      ConversationTickes: {
                        take: 1,
                        orderBy: { id: "desc" },
                        select: { createAt: true, type: true, message: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      return data
        ? {
            id: data.id,
            columns: data.StepsFunnelKanban.map(
              ({ StepsFunnelKanbanOnTickets, ...rest }) => ({
                ...rest,
                rows: StepsFunnelKanbanOnTickets.map(
                  ({ Tickets, ticketsId, ...re }) => {
                    const {
                      ContactsWAOnAccount,
                      SectorsAttendants,
                      Business,
                      id,
                      Sectors,
                      ConversationTickes,
                      _count,
                      protocol,
                      ...restTicket
                    } = Tickets;

                    const hasPendencie = !!(
                      ContactsWAOnAccount
                        .HumanServiceOnBusinessOnContactsWAOnAccount?._count
                        .HumanServiceReportLead ?? 0
                    );
                    return {
                      ...re,
                      ticket: {
                        ...restTicket,
                        id: ticketsId,
                        attendant: {
                          id: SectorsAttendants?.id!,
                          name: SectorsAttendants?.name!,
                          office: SectorsAttendants?.office ?? null,
                        },
                        hasPendencie,
                        content: {
                          ...(restTicket.status === "new" && {
                            color: "#ffc107",
                          }),
                          ...(restTicket.status === "open" && {
                            color: "#28a745",
                          }),
                          ...(_count.ConversationTickes && {
                            color: "#dc3545",
                          }),
                          ...(hasPendencie && {
                            color: "#fd7e14",
                          }),
                          ...(restTicket.status === "resolved" && {
                            color: "#007bff",
                          }),
                          protocol,
                          contactName: ContactsWAOnAccount.name,
                          contactImg: ContactsWAOnAccount.ContactsWA.img,
                          contactNumber:
                            ContactsWAOnAccount.ContactsWA.completeNumber,
                          sectorName: Sectors.name,
                          businessName: Business.name,
                          countUnreadMsg: _count.ConversationTickes,
                          ...(ConversationTickes.length && {
                            lastMsg: {
                              value: "🎤📷 Arquivo de midia",
                              ...(ConversationTickes[0].type === "text" && {
                                value: ConversationTickes[0].message,
                              }),
                              date: ConversationTickes[0].createAt,
                            },
                          }),
                        },
                      },
                    };
                  }
                ),
              })
            ),
          }
        : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Get Tag Asset Data`.");
    }
  }
}

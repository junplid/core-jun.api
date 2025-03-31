import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetTicketRepository_I, PropsFetch, ResultTicket } from "./Repository";

export class GetTicketImplementation implements GetTicketRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchInfoSectorAttendant(id: number): Promise<{
    previewTicketBusiness: boolean | null;
    previewTicketSector: boolean | null;
    sectorsId: number | null;
    businessId: number;
  } | null> {
    try {
      return await this.prisma.sectorsAttendants.findFirst({
        where: { id },
        select: {
          sectorsId: true,
          businessId: true,
          previewTicketBusiness: true,
          previewTicketSector: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }

  async fetchSectorsAttendants(id: number): Promise<number> {
    try {
      return await this.prisma.sectorsAttendants.count({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }

  async fetchSuperVisor(id: number): Promise<number> {
    try {
      return await this.prisma.supervisors.count({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }

  async fetchTicket(props: PropsFetch): Promise<ResultTicket | null> {
    try {
      const data = await this.prisma.tickets.findUnique({
        where: { deleted: false, id: props.id },
        select: {
          status: true,
          connectionId: true,
          sectorsId: true,
          destination: true,
          destinationSectorsAttendantsId: true,
          protocol: true,
          ConnectionOnBusiness: { select: { name: true } },
          ContactsWAOnAccount: {
            select: {
              name: true,
              TagOnBusinessOnContactsWAOnAccount: {
                select: {
                  TagOnBusiness: {
                    select: { Tag: { select: { name: true, id: true } } },
                  },
                },
              },
              ContactsWA: { select: { completeNumber: true, img: true } },
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
            },
          },
          _count: {
            select: {
              ConversationTickes: { where: { sentBy: "lead", read: false } },
            },
          },
          ConversationTickes: {
            where: { sentBy: "lead" },
            orderBy: { id: "desc" },
            take: 1,
            select: { type: true, message: true, createAt: true, read: true },
          },
          Sectors: { select: { name: true, previewPhone: true, id: true } },
          Business: { select: { name: true, id: true } },
          sectorsAttendantsId: true,
          StepsFunnelKanbanOnTickets: {
            where: { ticketsId: props.id },
            select: {
              StepsFunnelKanban: { select: { id: true, sequence: true } },
            },
          },
        },
      });

      return data
        ? {
            id: props.id,
            destination: data.destination,
            pendencies:
              data.ContactsWAOnAccount
                .HumanServiceOnBusinessOnContactsWAOnAccount?._count
                .HumanServiceReportLead ?? 0,
            destinationSectorsAttendantsId:
              data.destinationSectorsAttendantsId ?? undefined,
            attendantId: data.sectorsAttendantsId ?? undefined,
            status: data.status,
            sectorId: data.Sectors.id,
            businessId: data.Business.id,
            connectionName: data.ConnectionOnBusiness.name,
            content: {
              countUnreadMsg: data._count.ConversationTickes,
              ...(data.ConversationTickes.length && {
                lastMsg: {
                  value: "🎤📷 Arquivo de midia",
                  ...(data.ConversationTickes[0].type === "text" && {
                    value: data.ConversationTickes[0].message,
                  }),
                  date: data.ConversationTickes[0].createAt,
                },
              }),
              tags: data.ContactsWAOnAccount.TagOnBusinessOnContactsWAOnAccount.map(
                (t) => t.TagOnBusiness.Tag
              ),
              sectorName: data.Sectors.name,
              businessName: data.Business.name,
              columnId: data.StepsFunnelKanbanOnTickets[0].StepsFunnelKanban.id,
              contactName: data.ContactsWAOnAccount.name,
              contactNumber: data.ContactsWAOnAccount.ContactsWA.completeNumber,
              protocol: data.protocol,
              contactImg: data.ContactsWAOnAccount.ContactsWA.img,
            },
          }
        : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetTicketsRepository_I, PropsFetch, ResultTicket } from "./Repository";
import moment from "moment-timezone";

export class GetTicketsImplementation implements GetTicketsRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async fetchInfoSectorAttendant(id: number): Promise<{
    previewTicketBusiness: boolean | null;
    previewTicketSector: boolean | null;
    businessId: number;
    Sectors: { previewPhone: boolean; id: number } | null;
  } | null> {
    try {
      return await this.prisma.sectorsAttendants.findFirst({
        where: { id },
        select: {
          Sectors: { select: { previewPhone: true, id: true } },
          previewTicketBusiness: true,
          previewTicketSector: true,
          businessId: true,
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

  async fetchTickets(props: PropsFetch): Promise<ResultTicket[]> {
    try {
      const arrayOr: any[] = [{ name: { contains: props.search } }];

      if (props.user === "sectorsAttendants" && props.previewPhone) {
        arrayOr.push({
          ContactsWA: {
            completeNumber: { contains: props.search },
          },
        });
      }

      const filter = [];

      if (props.search) {
        filter.push(
          { ContactsWAOnAccount: { OR: arrayOr } },
          {
            ConversationTickes: {
              some: { message: { contains: props.search } },
            },
          }
        );
      }

      const data = await this.prisma.tickets.findMany({
        where: {
          deleted: !!props.deleted,
          ...(props.user === "sectorsAttendants" &&
            props.previewTicketBusiness && {
              businessId: props.businessId,
            }),
          ...(props.user === "sectorsAttendants" &&
            props.previewTicketSector && {
              sectorsId: props.sectorsId,
            }),
          ...(props.filter === "unread" && {
            ConversationTickes: { some: { read: false, sentBy: "lead" } },
            sectorsAttendantsId: props.userId,
          }),
          ...(props.filter === "pending" && {
            sectorsAttendantsId: props.userId,
            status: "open",
          }),
          ...(props.filter === "new" && {
            status: "new",
            ...(props.user === "sectorsAttendants" && {
              destination: "attendant",
              sectorsAttendantsId: props.userId,
              ...(props.previewTicketSector && {
                sectorsId: props.sectorsId,
                destination: "sector",
                sectorsAttendantsId: undefined,
              }),
              ...(props.previewTicketBusiness && {
                sectorsAttendantsId: undefined,
                destination: undefined,
                businessId: props.businessId,
              }),
            }),
          }),
          ...(props.filter === "resolved" && {
            status: "resolved",
            sectorsAttendantsId: props.userId,
          }),
          ...(props.filter === "serving" && {
            sectorsAttendantsId: props.userId,
            status: "open",
          }),
          ...(props.filter === "all" && {
            sectorsAttendantsId: props.userId,
            ...(props.user === "sectorsAttendants" && {
              ...(props.previewTicketSector && {
                sectorsId: props.sectorsId,
                destination: "sector",
                sectorsAttendantsId: undefined,
              }),
              ...(props.previewTicketBusiness && {
                sectorsAttendantsId: undefined,
                destination: undefined,
                businessId: props.businessId,
              }),
            }),
          }),
          ...((props.search ||
            props.tags?.length ||
            props.filter === "pending") && {
            ...(filter.length && { OR: filter }),
            ...((props.tags?.length || props.filter === "pending") && {
              ContactsWAOnAccount: {
                ...(props.tags?.length && {
                  TagOnBusinessOnContactsWAOnAccount: {
                    some: { TagOnBusiness: { tagId: { in: props.tags } } },
                  },
                }),
                ...(props.filter === "pending" && {
                  HumanServiceOnBusinessOnContactsWAOnAccount: {
                    HumanServiceReportLead: { some: { type: "pendency" } },
                  },
                }),
              },
            }),
          }),
        },
        select: {
          sectorsAttendantsId: true,
          id: true,
          status: true,
          Business: { select: { name: true } },
          ContactsWAOnAccount: {
            select: {
              name: true,
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
          Sectors: { select: { name: true, id: true } },
          _count: {
            select: {
              ConversationTickes: { where: { read: false, sentBy: "lead" } },
            },
          },
          ConversationTickes: {
            take: 1,
            orderBy: { id: "desc" },
            select: { createAt: true, type: true, message: true },
          },
        },
      });

      return data.map((t) => {
        const hasConversation = !!t.ConversationTickes.length;
        return {
          id: t.id,
          status: t.status,
          pendencies:
            t.ContactsWAOnAccount.HumanServiceOnBusinessOnContactsWAOnAccount
              ?._count.HumanServiceReportLead ?? 0,
          content: {
            contactName: t.ContactsWAOnAccount.name,
            contactImg: t.ContactsWAOnAccount.ContactsWA.img,
            sectorName: t.Sectors.name,
            businessName: t.Business.name,
            countUnreadMsg: t._count.ConversationTickes,
            ...(hasConversation && {
              lastMsg: {
                value: "🎤📷 Arquivo de midia",
                ...(t.ConversationTickes[0].type === "text" && {
                  value: t.ConversationTickes[0].message,
                }),
                date: moment(t.ConversationTickes[0].createAt)
                  .tz("America/Sao_Paulo")
                  .toDate(),
              },
            }),
          },
          attendantId: t.sectorsAttendantsId || undefined,
        };
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Connection`.");
    }
  }
}

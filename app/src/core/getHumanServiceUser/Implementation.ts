import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { GetHumanServiceUserRepository_I } from "./Repository";

export class GetHumanServiceUserImplementation
  implements GetHumanServiceUserRepository_I
{
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async findSectorsAttendants(props: { userId: number }): Promise<{
    id: number;
    office: string;
    name: string;
    username: string;
    imageName: string | null;
    previewTicketBusiness: boolean;
    previewTicketSector: boolean;
    allowAddingNotesToLeadProfile: boolean;
    allowInsertionAndRemovalOfTags: boolean;
    allowReOpeningATicket: boolean;
    allowStartingNewTicket: boolean;
    allowToUseQuickMessages: boolean;
    sector?: {
      id: number;
      previewPhone: boolean;
      removeTicket: boolean;
      addTag: boolean;
      name: string;
      business: string;
      businessId: number;
    };
  } | null> {
    try {
      const data = await this.prisma.sectorsAttendants.findUnique({
        where: { id: props.userId },
        select: {
          id: true,
          office: true,
          name: true,
          username: true,
          previewTicketBusiness: true,
          previewTicketSector: true,
          allowAddingNotesToLeadProfile: true,
          allowInsertionAndRemovalOfTags: true,
          allowReOpeningATicket: true,
          allowStartingNewTicket: true,
          allowToUseQuickMessages: true,
          imageName: true,
          Sectors: {
            select: {
              id: true,
              previewPhone: true,
              removeTicket: true,
              addTag: true,
              name: true,
              businessId: true,
              Business: { select: { name: true } },
            },
          },
        },
      });

      return data
        ? {
            id: data.id,
            office: data.office,
            name: data.name,
            username: data.username,
            previewTicketBusiness: data.previewTicketBusiness,
            previewTicketSector: data.previewTicketSector,
            allowAddingNotesToLeadProfile: data.allowAddingNotesToLeadProfile,
            allowInsertionAndRemovalOfTags: data.allowInsertionAndRemovalOfTags,
            allowReOpeningATicket: data.allowReOpeningATicket,
            allowStartingNewTicket: data.allowStartingNewTicket,
            allowToUseQuickMessages: data.allowToUseQuickMessages,
            imageName: data.imageName,
            ...(data.Sectors && {
              sector: {
                id: data.Sectors.id,
                previewPhone: data.Sectors.previewPhone,
                removeTicket: data.Sectors.removeTicket,
                addTag: data.Sectors.addTag,
                name: data.Sectors.name,
                businessId: data.Sectors.businessId,
                business: data.Sectors.Business.name,
              },
            }),
          }
        : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account Login`.");
    }
  }

  async findSupervisors(props: { userId: number }): Promise<{
    id: number;
    name: string;
    username: string;
    imageName: string | null;
    sector: {
      id: number;
      name: string;
      business: string;
      businessId: number;
      previewPhone: boolean;
      removeTicket: boolean;
      addTag: boolean;
    }[];
  } | null> {
    try {
      const data = await this.prisma.supervisors.findUnique({
        where: { id: props.userId },
        select: {
          id: true,
          username: true,
          name: true,
          imageName: true,
          Sectors: {
            select: {
              id: true,
              previewPhone: true,
              removeTicket: true,
              addTag: true,
              name: true,
              businessId: true,
              Business: {
                select: { name: true },
              },
            },
          },
        },
      });

      return data
        ? {
            id: data.id,
            username: data.username,
            name: data.name,
            imageName: data.imageName,
            sector: data.Sectors?.map(({ Business, ...rest }) => ({
              ...rest,
              business: Business.name,
            })),
          }
        : null;
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Find Account Login`.");
    }
  }
}

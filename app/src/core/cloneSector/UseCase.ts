import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneSectorDTO_I } from "./DTO";

export class CreateCloneSectorUseCase {
  constructor() {}

  async run({ accountId, id: idOrigin }: CreateCloneSectorDTO_I) {
    const exist = await prisma.sectors.findFirst({
      where: { id: idOrigin, accountId },
      select: {
        id: true,
        name: true,
        Business: { select: { name: true, id: true } },
        addTag: true,
        fromTime: true,
        funnelKanbanId: true,
        LackResponses: {
          select: {
            finish: true,
            sendFlow: true,
            sendMessage: true,
            sendSector: true,
            typeBehavior: true,
            typeDuration: true,
            valueDuration: true,
          },
        },
        maximumService: true,
        messageOutsideOfficeHours: true,
        operatingDays: true,
        previewPhone: true,
        removeTicket: true,
        SectorsMessages: {
          select: {
            messageFinishService: true,
            messageTransferTicket: true,
            messageWelcome: true,
            messageWelcomeToOpenTicket: true,
          },
        },
        SectorsOnConnections: { select: { connectionId: true } },
        signAttendant: true,
        signBusiness: true,
        signSector: true,
        status: true,
        supervisorsId: true,
        toTime: true,
        typeDistribution: true,
        timeToSendToAllSectors: true,
      },
    });

    if (!exist?.id) {
      throw new ErrorResponse(400).toast({
        title: "Setor não encontrado",
        type: "error",
      });
    }

    const {
      id,
      name,
      LackResponses,
      SectorsMessages,
      SectorsOnConnections,
      messageOutsideOfficeHours,
      timeToSendToAllSectors,
      Business,
      ...rest
    } = exist;

    try {
      const { _count, ...nextConnection } = await prisma.sectors.create({
        data: {
          accountId,
          businessId: Business.id,
          name: name + "_COPIA_" + new Date().getTime(),
          ...rest,
          ...(LackResponses && {
            LackResponses: { create: { ...LackResponses, accountId } },
          }),
          ...(SectorsMessages && {
            SectorsMessages: { create: { ...SectorsMessages, accountId } },
          }),
          ...(!!SectorsOnConnections.length && {
            SectorsOnConnections: {
              createMany: {
                data: SectorsOnConnections.map(({ connectionId }) => ({
                  connectionId,
                })),
              },
            },
          }),
        },
        select: {
          name: true,
          id: true,
          createAt: true,
          status: true,
          _count: { select: { SectorsAttendants: true } },
        },
      });
      return {
        message: "OK!",
        status: 200,
        sector: {
          ...nextConnection,
          business: Business.name,
          countSectorsAttendants: _count.SectorsAttendants,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Erro ao tentar clonar setor",
        type: "error",
      });
    }
  }
}

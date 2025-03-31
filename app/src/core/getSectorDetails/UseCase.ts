import { GetSectorDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetSectorDetailsUseCase {
  constructor() {}

  async run(dto: GetSectorDetailsDTO_I) {
    const sector = await prisma.sectors.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      include: {
        Business: { select: { id: true, name: true } },
        LackResponses: true,
        SectorsMessages: true,
        SectorsOnConnections: { select: { connectionId: true } },
        SectorsAttendants: { select: { id: true } },
        Supervisors: { select: { id: true } },
      },
    });

    if (!sector) {
      throw new ErrorResponse(400).toast({
        title: `Setor não foi encontrado!`,
        type: "error",
      });
    }

    const {
      accountId,
      createAt,
      id,
      interrupted,
      updateAt,
      LackResponses,
      SectorsAttendants,
      SectorsMessages,
      SectorsOnConnections,
      Supervisors,
      ...restSector
    } = sector;

    let lackResponses: any = {};
    if (LackResponses) {
      const { id, accountId, ...re } = LackResponses;
      lackResponses = re;
    }
    let sectorsMessages: any = {};
    if (SectorsMessages) {
      const { id, accountId, ...re } = SectorsMessages;
      sectorsMessages = re;
    }

    return {
      message: "OK!",
      status: 200,
      sector: {
        ...restSector,
        ...(lackResponses && { lackResponses }),
        ...(sectorsMessages && { sectorsMessages }),
        sectorsAttendantsIds: SectorsAttendants.map((s) => s.id),
        allowedConnections: SectorsOnConnections.map((s) => s.connectionId),
        supervisorsId: Supervisors?.id,
      },
    };
  }
}

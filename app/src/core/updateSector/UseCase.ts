import { UpdateSectorDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateSectorUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateSectorDTO_I) {
    const exists = await prisma.sectors.findFirst({
      where: { accountId, id },
    });

    if (!exists) {
      throw new ErrorResponse(400).toast({
        title: `Setor não encontrado`,
        type: "error",
      });
    }

    const {
      status,
      businessId,
      supervisorsId,
      funnelKanbanId,
      operatingDays,
      sectorsAttendantsIds,
      lackResponse,
      sectorsMessages,
      allowedConnections,
      ...rest
    } = dto;

    try {
      if (lackResponse) {
        const exist = await prisma.lackResponses.findFirst({
          where: { sectorsId: id },
          select: { id: true },
        });
        if (exist) {
          await prisma.lackResponses.update({
            where: { id: exist.id },
            data: lackResponse,
          });
        } else {
          await prisma.lackResponses.create({
            data: { ...lackResponse, accountId, sectorsId: id },
          });
        }
      }
      const newAttendant = await prisma.sectors.update({
        where: { accountId, id },
        data: {
          ...rest,
          ...(status !== undefined && { status }),
          ...(operatingDays !== undefined && {
            operatingDays: operatingDays.join("-"),
          }),
          ...(sectorsMessages && {
            SectorsMessages: { update: { ...sectorsMessages, accountId } },
          }),
          ...(sectorsAttendantsIds !== undefined && {
            SectorsAttendants: {
              deleteMany: { sectorsId: id },
              connect: sectorsAttendantsIds.map((id) => ({ id })),
            },
          }),
          ...(allowedConnections !== undefined && {
            SectorsOnConnections: {
              deleteMany: { sectorId: id },
              createMany: {
                data: allowedConnections.map((connectionId) => ({
                  connectionId,
                })),
              },
            },
          }),
        },
        select: {
          Business: { select: { name: true } },
          _count: {
            select: { SectorsAttendants: true },
          },
        },
      });

      return {
        message: "OK!",
        status: 200,
        sector: {
          business: newAttendant.Business.name,
          countSectorsAttendants: newAttendant._count.SectorsAttendants,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Erro ao tentar atualizar setor`,
        type: "error",
      });
    }
  }
}

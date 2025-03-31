import { UpdateSectorsAttendantDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateSectorsAttendantUseCase {
  async run(dto: UpdateSectorsAttendantDTO_I) {
    const exists = await prisma.sectorsAttendants.findUnique({
      where: { id: dto.id },
      select: { id: true },
    });

    if (!exists) {
      throw new ErrorResponse(400).toast({
        title: `Atendante não encontrado!`,
        type: "error",
      });
    }

    const { id, accountId, sectorsId, businessId, status, ...rest } = dto;

    try {
      const updatedAttendant = await prisma.sectorsAttendants.update({
        where: { id: dto.id },
        data: {
          ...rest,
          ...(status !== undefined && { status: !!status }),
          sectorsId,
          businessId,
        },
        select: {
          Business: { select: { name: true } },
          Sectors: { select: { name: true } },
        },
      });

      return {
        message: "Atendente atualizado com sucesso!",
        status: 200,
        attendant: {
          business: updatedAttendant.Business.name,
          sectorName: updatedAttendant.Sectors?.name,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar atendante`,
        type: "error",
      });
    }
  }
}

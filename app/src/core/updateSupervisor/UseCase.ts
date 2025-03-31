import { UpdateSupervisorDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateSupervisorUseCase {
  async run(dto: UpdateSupervisorDTO_I) {
    const exists = await prisma.supervisors.findUnique({
      where: { id: dto.id },
      select: { id: true },
    });

    if (!exists) {
      throw new ErrorResponse(400).toast({
        title: `Supervisor não encontrado!`,
        type: "error",
      });
    }

    const updatedSupervisor = await prisma.supervisors.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        password: dto.password,
        username: dto.username,
        ...(dto.businessIds?.length && {
          BusinessOnSupervisors: {
            deleteMany: { supervisorsId: dto.id },
            createMany: {
              data: dto.businessIds.map((businessId) => ({ businessId })),
            },
          },
        }),
      },
      select: {
        BusinessOnSupervisors: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    if (dto.sectorIds?.length) {
      for await (const sectorId of dto.sectorIds) {
        await prisma.sectors.update({
          where: { id: sectorId },
          data: { supervisorsId: dto.id },
        });
      }
    }

    return {
      message: "Supervisor atualizado com sucesso!",
      status: 200,
      supervisor: {
        business: updatedSupervisor.BusinessOnSupervisors.map(
          (b) => b.Business.name
        ).join(", "),
      },
    };
  }
}

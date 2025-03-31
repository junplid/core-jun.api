import { CloneSupervisorDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneSupervisorUseCase {
  constructor() {}

  async run(dto: CloneSupervisorDTO_I) {
    const supervisor = await prisma.supervisors.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        password: true,
        username: true,
        BusinessOnSupervisors: {
          select: { businessId: true },
        },
      },
    });

    if (!supervisor) {
      throw new ErrorResponse(400).toast({
        title: "Supervisor não encontrado",
        type: "error",
      });
    }

    const { BusinessOnSupervisors, username, ...rest } = supervisor;

    const clonedSupervisor = await prisma.supervisors.create({
      data: {
        ...rest,
        username: `COPIA_${new Date().getTime()}_${supervisor.username}`,
        accountId: dto.accountId,
        name: `${supervisor.name}_COPIA_${new Date().getTime()}`,
        BusinessOnSupervisors: {
          createMany: {
            data: BusinessOnSupervisors.map((b) => ({
              businessId: b.businessId,
            })),
          },
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        createAt: true,
        BusinessOnSupervisors: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    const { BusinessOnSupervisors: clonedBusiness, ...clonedRest } =
      clonedSupervisor;

    return {
      message: "Supervisor clonado com sucesso!",
      status: 200,
      supervisor: {
        ...clonedRest,
        business: clonedBusiness.map((b) => b.Business.name).join(", "),
      },
    };
  }
}

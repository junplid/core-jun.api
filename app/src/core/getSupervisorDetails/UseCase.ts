import { GetSupervisorDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetSupervisorDetailsUseCase {
  constructor() {}

  async run(dto: GetSupervisorDetailsDTO_I) {
    const supervisor = await prisma.supervisors.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        password: true,
        username: true,
        updateAt: true,
        createAt: true,
        Sectors: { select: { name: true, id: true } },
        BusinessOnSupervisors: {
          select: { businessId: true, Business: { select: { name: true } } },
        },
      },
    });

    if (!supervisor) {
      throw new ErrorResponse(400).toast({
        title: `Supervisor não foi encontrado!`,
        type: "error",
      });
    }

    const { BusinessOnSupervisors, ...rest } = supervisor;

    return {
      message: "OK!",
      status: 200,
      supervisor: {
        ...rest,
        business: BusinessOnSupervisors.map((b) => ({
          name: b.Business.name,
          id: b.businessId,
        })),
      },
    };
  }
}

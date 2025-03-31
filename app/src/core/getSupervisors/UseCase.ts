import { GetSupervisorsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetSupervisorsUseCase {
  constructor() {}

  async run(dto: GetSupervisorsDTO_I) {
    const supervisors = await prisma.supervisors.findMany({
      where: dto,
      select: {
        name: true,
        createAt: true,
        id: true,
        username: true,
        BusinessOnSupervisors: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    const nextSupervisores = supervisors.map(
      ({ BusinessOnSupervisors, ...d }) => ({
        ...d,
        business: BusinessOnSupervisors.map((b) => b.Business.name).join(", "),
      })
    );

    return {
      message: "OK!",
      status: 200,
      supervisors: nextSupervisores,
    };
  }
}

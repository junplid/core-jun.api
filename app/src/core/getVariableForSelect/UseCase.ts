import { GetVariableForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetVariableForSelectUseCase {
  constructor() {}

  async run(dto: GetVariableForSelectDTO_I) {
    const variables = await prisma.variable.findMany({
      where: {
        ...(dto.type?.length && { type: { in: dto.type } }),
        VariableOnBusiness: {
          some: {
            businessId: { in: dto.businessIds },
            Business: { accountId: dto.accountId },
          },
        },
        ...(dto.name && { name: { contains: dto.name } }),
      },
      orderBy: { id: "desc" },
      select: { name: true, id: true, value: true },
    });

    return { message: "OK!", status: 200, variables };
  }
}

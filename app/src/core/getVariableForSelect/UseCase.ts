import { GetVariableForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetVariableForSelectUseCase {
  constructor() {}

  async run(dto: GetVariableForSelectDTO_I) {
    const variables = await prisma.variable.findMany({
      where: {
        ...(dto.businessIds?.length && {
          VariableOnBusiness: { some: { businessId: { in: dto.businessIds } } },
        }),
        OR: [{ accountId: null }, { accountId: dto.accountId }],
        ...(dto.name && { name: { contains: dto.name } }),
        ...(dto.type?.length && { type: { in: dto.type } }),
      },
      orderBy: { id: "desc" },
      select: { name: true, id: true, value: true, type: true },
    });

    return { message: "OK!", status: 200, variables };
  }
}

import { prisma } from "../../adapters/Prisma/client";
import { GetVariableBusinessDTO_I } from "./DTO";

export class GetVariableBusinessUseCase {
  constructor() {}

  async run({ businessIds, accountId, ...dto }: GetVariableBusinessDTO_I) {
    const fetch = await prisma.variable.findMany({
      orderBy: { id: "desc" },
      where: {
        ...(businessIds?.length && {
          VariableOnBusiness: { some: { businessId: { in: businessIds } } },
        }),
        OR: [{ accountId: null }, { accountId }],
        ...dto,
      },
      select: {
        id: true,
        name: true,
        value: true,
        type: true,
        VariableOnBusiness: {
          select: { Business: { select: { name: true, id: true } } },
        },
      },
    });

    const variables = fetch.map(({ VariableOnBusiness, ...s }) => ({
      ...s,
      business: VariableOnBusiness.map((s) => s.Business),
    }));

    return {
      message: "OK!",
      status: 200,
      variables,
    };
  }
}

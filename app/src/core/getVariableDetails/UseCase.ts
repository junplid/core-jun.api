import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetVariableDetailsDTO_I } from "./DTO";

export class GetVariableDetailsUseCase {
  constructor() {}

  async run({ accountId, id }: GetVariableDetailsDTO_I) {
    const vars = await prisma.variable.findFirst({
      where: { id, OR: [{ accountId }, { accountId: null }] },
      select: {
        type: true,
        name: true,
        value: true,
        VariableOnBusiness: {
          select: { Business: { select: { name: true, id: true } } },
        },
      },
    });

    if (!vars) {
      throw new ErrorResponse(400).toast({
        title: `Variável não foi encontrada`,
        type: "error",
      });
    }

    const { type, VariableOnBusiness, ...variable } = vars;
    return {
      message: "OK!",
      status: 200,
      variable: {
        id,
        ...variable,
        business: VariableOnBusiness.map((s) => s.Business),
      },
    };
  }
}

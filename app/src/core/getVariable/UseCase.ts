import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetVariableDTO_I } from "./DTO";

export class GetVariableUseCase {
  constructor() {}

  async run(dto: GetVariableDTO_I) {
    const vars = await prisma.variable.findFirst({
      where: { ...dto, type: { not: "system" } },
      select: {
        type: true,
        name: true,
        value: true,
        VariableOnBusiness: {
          select: { Business: { select: { id: true } } },
        },
      },
    });

    if (!vars) {
      throw new ErrorResponse(400).toast({
        title: `Variável não foi encontrada`,
        type: "error",
      });
    }

    const { VariableOnBusiness, ...variable } = vars;
    return {
      message: "OK!",
      status: 200,
      variable: {
        id: dto.id,
        ...variable,
        businessIds: VariableOnBusiness.map((s) => s.Business.id),
      },
    };
  }
}

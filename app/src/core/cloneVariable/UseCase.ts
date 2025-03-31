import { CloneVariableDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneVariableUseCase {
  constructor() {}

  async run(dto: CloneVariableDTO_I) {
    const varr = await prisma.variable.findUnique({
      where: { id: dto.id, type: { not: "system" } },
      select: {
        name: true,
        type: true,
        value: true,
        VariableOnBusiness: { select: { businessId: true } },
      },
    });

    if (!varr) {
      throw new ErrorResponse(400).toast({
        title: "Variavel não encontrada",
        type: "error",
      });
    }

    const { VariableOnBusiness: VariableOnBusiness1, ...rest } = varr;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedTag = await prisma.variable.create({
      data: {
        ...rest,
        name,
        accountId: dto.accountId,
        VariableOnBusiness: {
          createMany: {
            data: VariableOnBusiness1.map(({ businessId }) => ({ businessId })),
          },
        },
      },
      select: {
        id: true,
        value: true,
        VariableOnBusiness: {
          select: {
            Business: { select: { name: true } },
          },
        },
      },
    });

    const { VariableOnBusiness, ...restNext } = clonedTag;

    return {
      message: "Variavel clonada com sucesso!",
      status: 200,
      variable: {
        ...restNext,
        name,
        business: VariableOnBusiness.map((b) => b.Business.name).join(", "),
      },
    };
  }
}

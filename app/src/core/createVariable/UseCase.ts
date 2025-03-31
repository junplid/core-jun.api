import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateVariableDTO_I } from "./DTO";

export class CreateVariableUseCase {
  constructor() {}

  async run({ targetId, ...dto }: CreateVariableDTO_I) {
    const exist = await prisma.variable.findFirst({
      where: {
        accountId: dto.accountId,
        type: dto.type,
        name: dto.name,
        VariableOnBusiness: { some: { businessId: { in: dto.businessIds } } },
      },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Variável já existe!`,
      });
    }

    const { VariableOnBusiness, ...variable } = await prisma.variable.create({
      data: {
        accountId: dto.accountId,
        type: dto.type,
        name: dto.name,
        ...(dto.type === "constant" && { value: dto.value }),
        VariableOnBusiness: {
          createMany: {
            data: dto.businessIds.map((businessId) => ({
              businessId,
            })),
          },
        },
      },
      select: {
        id: true,
        VariableOnBusiness: {
          select: { Business: { select: { name: true } } },
        },
        value: true,
      },
    });

    return {
      message: "OK!",
      status: 201,
      variable: {
        ...variable,
        targetId,
        business: VariableOnBusiness.map((s) => s.Business.name).join(", "),
      },
    };
  }
}

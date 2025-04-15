import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateVariableDTO_I } from "./DTO";

export class CreateVariableUseCase {
  constructor() {}

  async run({ targetId, businessIds = [], ...dto }: CreateVariableDTO_I) {
    try {
      const exist = await prisma.variable.findFirst({
        where: {
          accountId: dto.accountId,
          type: dto.type,
          name: dto.name,
          OR: [
            {
              VariableOnBusiness: {
                some: { businessId: { in: businessIds } },
              },
            },
            {
              VariableOnBusiness: {
                some: { businessId: { equals: null as any } },
              },
            },
          ],
        },
      });

      if (exist) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: `Já existe uma variável com esse nome.`,
        });
      }

      const { VariableOnBusiness, ...variable } = await prisma.variable.create({
        data: {
          accountId: dto.accountId,
          type: dto.type,
          name: dto.name,
          ...(dto.type === "constant" && { value: dto.value }),
          ...(businessIds?.length && {
            VariableOnBusiness: {
              createMany: {
                data: businessIds?.map((businessId) => ({ businessId })),
              },
            },
          }),
        },
        select: {
          id: true,
          VariableOnBusiness: {
            select: { Business: { select: { name: true, id: true } } },
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
          business: VariableOnBusiness.map((s) => s.Business),
        },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel criar variável.",
        type: "error",
      });
    }
  }
}

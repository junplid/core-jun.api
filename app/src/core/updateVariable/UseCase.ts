import { UpdateVariableDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateVariableUseCase {
  constructor() {}

  async run({ id, accountId, businessIds, ...dto }: UpdateVariableDTO_I) {
    const fetchVariableId = await prisma.variable.count({
      where: { id, accountId },
    });

    if (!fetchVariableId) {
      throw new ErrorResponse(400).toast({
        title: `Variável não encontrada!`,
        type: "error",
      });
    }
    try {
      await prisma.variable.update({
        where: { id },
        data: {
          ...dto,
          ...(businessIds?.length && {
            VariableOnBusiness: {
              deleteMany: { variableId: id },
              createMany: {
                data: businessIds.map((businessId) => ({
                  businessId,
                })),
              },
            },
          }),
        },
      });
      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel atualizar a variável!`,
        type: "error",
      });
    }
  }
}

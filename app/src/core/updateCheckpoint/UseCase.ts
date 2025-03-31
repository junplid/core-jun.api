import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateCheckpointDTO_I } from "./DTO";

export class UpdateCheckpointUseCase {
  constructor() {}

  async run({ accountId, id, businessIds, ...dto }: UpdateCheckpointDTO_I) {
    const exist = await prisma.checkPoint.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Checkpoint não foi encontrado`,
        type: "error",
      });
    }

    try {
      const { CheckPointOnBusiness } = await prisma.checkPoint.update({
        where: { id },
        data: {
          ...dto,
          ...(businessIds?.length && {
            CheckPointOnBusiness: {
              deleteMany: { checkPointId: id },
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          }),
        },
        select: {
          CheckPointOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
        },
      });

      return {
        message: "OK!",
        status: 200,
        checkpoint: {
          business: CheckPointOnBusiness.map((s) => s.Business.name).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Checkpoint`,
        type: "error",
      });
    }
  }
}

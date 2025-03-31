import { GetCheckpointDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCheckpointUseCase {
  constructor() {}

  async run(dto: GetCheckpointDTO_I) {
    const tag = await prisma.checkPoint.findFirst({
      where: dto,
      orderBy: { id: "desc" },
      select: {
        name: true,
        CheckPointOnBusiness: {
          select: { Business: { select: { id: true } } },
        },
      },
    });

    if (!tag) {
      throw new ErrorResponse(400).toast({
        title: `Checkpoint não foi encontrada!`,
        type: "error",
      });
    }
    const { CheckPointOnBusiness, ...rest } = tag;
    return {
      message: "OK!",
      status: 200,
      checkpoint: {
        ...rest,
        businessIds: CheckPointOnBusiness.map((s) => s.Business.id),
      },
    };
  }
}

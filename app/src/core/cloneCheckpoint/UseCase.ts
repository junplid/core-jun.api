import { CloneCheckpointDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneCheckpointUseCase {
  constructor() {}

  async run(dto: CloneCheckpointDTO_I) {
    const check = await prisma.checkPoint.findUnique({
      where: dto,
      select: { name: true, CheckPointOnBusiness: true },
    });

    if (!check) {
      throw new ErrorResponse(400).toast({
        title: "Checkpoint não encontrado",
        type: "error",
      });
    }

    const { CheckPointOnBusiness: CheckPointOnBusiness1, ...rest } = check;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedTag = await prisma.checkPoint.create({
      data: {
        score: 0,
        name,
        accountId: dto.accountId,
        CheckPointOnBusiness: {
          createMany: {
            data: CheckPointOnBusiness1.map(({ businessId }) => ({
              businessId,
            })),
          },
        },
      },
      select: {
        id: true,
        CheckPointOnBusiness: {
          select: {
            Business: { select: { name: true } },
          },
        },
      },
    });

    const { CheckPointOnBusiness, ...restNext } = clonedTag;

    return {
      message: "Checkpoint clonada com sucesso!",
      status: 200,
      checkpoint: {
        ...restNext,
        name,
        business: CheckPointOnBusiness.map((b) => b.Business.name).join(", "),
      },
    };
  }
}

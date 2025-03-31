import { GetCheckpointDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCheckpointDetailsUseCase {
  constructor() {}

  async run(dto: GetCheckpointDetailsDTO_I) {
    const checkk = await prisma.checkPointOnBusiness.findFirst({
      where: { Business: { accountId: dto.accountId }, checkPointId: dto.id },
      orderBy: { id: "desc" },
      select: {
        _count: { select: { CheckPointOnBusinessOnContactWAOnAccount: true } },
        CheckPoint: {
          select: {
            name: true,
            id: true,
            CheckPointOnBusiness: {
              select: { Business: { select: { name: true, id: true } } },
            },
          },
        },
      },
    });

    if (!checkk) {
      throw new ErrorResponse(400).toast({
        title: `Checkpoint não foi encontrada!`,
        type: "error",
      });
    }

    const {
      _count,
      CheckPoint: { CheckPointOnBusiness, ...check },
    } = checkk;

    return {
      message: "OK!",
      status: 200,
      checkpoint: {
        ...check,
        score: _count.CheckPointOnBusinessOnContactWAOnAccount,
        business: CheckPointOnBusiness.map((s) => s.Business),
      },
    };
  }
}

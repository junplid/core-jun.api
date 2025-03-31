import { GetTagDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTagUseCase {
  constructor() {}

  async run(dto: GetTagDTO_I) {
    const tag = await prisma.tag.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        name: true,
        type: true,
        TagOnBusiness: {
          select: { Business: { select: { id: true } } },
        },
      },
    });

    if (!tag) {
      throw new ErrorResponse(400).toast({
        title: `Tag não foi encontrada!`,
        type: "error",
      });
    }
    const { TagOnBusiness, ...rest } = tag;
    return {
      message: "OK!",
      status: 200,
      tag: {
        ...rest,
        businessIds: TagOnBusiness.map((s) => s.Business.id),
      },
    };
  }
}

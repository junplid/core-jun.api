import { GetTagDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTagDetailsUseCase {
  constructor() {}

  async run(dto: GetTagDetailsDTO_I) {
    const tagg = await prisma.tagOnBusiness.findFirst({
      where: { Business: { accountId: dto.accountId }, tagId: dto.id },
      orderBy: { id: "desc" },
      select: {
        _count: { select: { TagOnBusinessOnContactsWAOnAccount: true } },
        Tag: {
          select: {
            name: true,
            id: true,
            type: true,
            TagOnBusiness: {
              select: { Business: { select: { name: true, id: true } } },
            },
          },
        },
      },
    });

    if (!tagg) {
      throw new ErrorResponse(400).toast({
        title: `Tag não foi encontrada!`,
        type: "error",
      });
    }

    const {
      _count,
      Tag: { TagOnBusiness, ...tag },
    } = tagg;

    return {
      message: "OK!",
      status: 200,
      tags: {
        ...tag,
        records: _count.TagOnBusinessOnContactsWAOnAccount,
        business: TagOnBusiness.map((s) => s.Business),
      },
    };
  }
}

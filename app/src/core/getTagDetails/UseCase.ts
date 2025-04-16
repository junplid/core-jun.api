import { GetTagDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTagDetailsUseCase {
  constructor() {}

  async run(dto: GetTagDetailsDTO_I) {
    const tagg = await prisma.tag.findFirst({
      where: { accountId: dto.accountId, id: dto.id },
      orderBy: { id: "desc" },
      select: {
        _count: { select: { TagOnContactsWAOnAccount: true } },
        name: true,
        id: true,
        type: true,
        TagOnBusiness: {
          select: { Business: { select: { name: true, id: true } } },
        },
      },
    });

    if (!tagg) {
      throw new ErrorResponse(400).toast({
        title: `Tag não foi encontrada!`,
        type: "error",
      });
    }

    const { _count, TagOnBusiness, ...tag } = tagg;

    return {
      message: "OK!",
      status: 200,
      tags: {
        ...tag,
        records: _count.TagOnContactsWAOnAccount,
        business: TagOnBusiness.map((s) => s.Business),
      },
    };
  }
}

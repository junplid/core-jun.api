import { GetTagsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetTagsUseCase {
  constructor() {}

  async run(dto: GetTagsDTO_I) {
    const tags = await prisma.tagOnBusiness.findMany({
      where: { Business: { accountId: dto.accountId } },
      orderBy: { id: "desc" },
      select: {
        _count: {
          select: {
            TagOnBusinessOnContactsWAOnAccount: true,
          },
        },
        Tag: {
          select: {
            name: true,
            id: true,
            type: true,
            TagOnBusiness: { select: { Business: { select: { name: true } } } },
          },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      tags: tags.map(({ _count, Tag: { TagOnBusiness, ...tag } }) => ({
        records: _count.TagOnBusinessOnContactsWAOnAccount,
        ...tag,
        business: TagOnBusiness.map((s) => s.Business.name).join(", "),
      })),
    };
  }
}

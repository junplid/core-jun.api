import { GetTagsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetTagsUseCase {
  constructor() {}

  async run(dto: GetTagsDTO_I) {
    const tags = await prisma.tag.findMany({
      where: { accountId: dto.accountId },
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

    return {
      message: "OK!",
      status: 200,
      tags: [
        ...tags.map(({ _count, TagOnBusiness, ...tag }) => ({
          records: _count.TagOnContactsWAOnAccount,
          ...tag,
          businesses: TagOnBusiness.map((s) => s.Business),
        })),
        {
          id: 22,
          name: "⭐_CLIENTE_JUNPLID",
          type: "contactwa",
          businesses: [],
          records: 16,
        },
      ],
    };
  }
}

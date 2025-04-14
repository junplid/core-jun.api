import { GetBusinessesDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetBusinessesUseCase {
  constructor() {}

  async run({ accountId, page = 1, ...dto }: GetBusinessesDTO_I) {
    const pageSize = 15;
    const skip = (page - 1) * pageSize;

    const businesses = await prisma.business.findMany({
      orderBy: { createAt: "desc" },
      where: {
        accountId,
        ...(dto.name && {
          name: { contains: dto.name, mode: "insensitive" },
        }),
      },
      select: {
        id: true,
        name: true,
        createAt: true,
        updateAt: true,
      },
      take: pageSize,
      skip,
    });

    return {
      message: "OK!",
      status: 200,
      businesses,
    };
  }
}

import { prisma } from "../../adapters/Prisma/client";
import { GetFbPixelsForSelectDTO_I } from "./DTO";

export class GetFbPixelsForSelectUseCase {
  constructor() {}

  async run(dto: GetFbPixelsForSelectDTO_I) {
    const fbPixels = await prisma.fbPixel.findMany({
      where: {
        accountId: dto.accountId,
        ...(dto.businessId?.length && { businessId: { in: dto.businessId } }),
      },
      orderBy: { id: "desc" },
      select: { id: true, name: true },
    });

    return { message: "OK!", status: 200, fbPixels };
  }
}

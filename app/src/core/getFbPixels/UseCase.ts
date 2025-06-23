import { GetFbPixelsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetFbPixelsUseCase {
  constructor() {}

  async run(dto: GetFbPixelsDTO_I) {
    const fbPixels = await prisma.fbPixel.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        Business: { select: { id: true, name: true } },
        name: true,
        id: true,
        pixel_id: true,
      },
    });

    return {
      message: "OK!",
      status: 200,
      fbPixels: fbPixels.map(({ Business, ...pixel }) => ({
        ...pixel,
        business: Business,
      })),
    };
  }
}

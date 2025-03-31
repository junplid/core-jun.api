import { prisma } from "../../adapters/Prisma/client";
import { GetLinksTrackingPixelDTO_I } from "./DTO";

export class GetLinksTrackingPixelUseCase {
  constructor() {}

  async run(dto: GetLinksTrackingPixelDTO_I) {
    const linkTrackingPixel = await prisma.linkTrackingPixel.findMany({
      where: dto,
      select: {
        id: true,
        Business: { select: { name: true } },
        link: true,
        name: true,
        createAt: true,
        // _count: {
        //   select: {
        //     LinkTrackingPixelEvents: true,
        //   },
        // },
      },
    });

    return {
      message: "OK!",
      status: 200,
      linkTrackingPixel: linkTrackingPixel.map(({ Business, ...rest }) => ({
        ...rest,
        business: Business.name,
      })),
    };
  }
}

import { GetLinkTrackingPixelDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetLinkTrackingPixelUseCase {
  constructor() {}

  async run(dto: GetLinkTrackingPixelDTO_I) {
    const tag = await prisma.linkTrackingPixel.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: { name: true, link: true, Business: { select: { id: true } } },
    });

    if (!tag) {
      throw new ErrorResponse(400).toast({
        title: `Link de rastreio não foi encontrado`,
        type: "error",
      });
    }
    const { Business, ...rest } = tag;
    return {
      message: "OK!",
      status: 200,
      linkTrackingPixel: {
        ...rest,
        businessId: Business.id,
      },
    };
  }
}

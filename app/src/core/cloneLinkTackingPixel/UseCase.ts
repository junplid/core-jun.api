import { CloneLinkTackingPixelDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneLinkTackingPixelUseCase {
  constructor() {}

  async run(dto: CloneLinkTackingPixelDTO_I) {
    const linkk = await prisma.linkTrackingPixel.findUnique({
      where: { id: dto.id },
      select: { name: true, link: true, businessId: true },
    });

    if (!linkk) {
      throw new ErrorResponse(400).toast({
        title: "Link não encontrado",
        type: "error",
      });
    }

    const { businessId: businessIdd, ...rest } = linkk;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedTag = await prisma.linkTrackingPixel.create({
      data: {
        ...rest,
        name,
        accountId: dto.accountId,
        businessId: businessIdd,
      },
      select: {
        link: true,
        id: true,
        Business: { select: { name: true } },
      },
    });

    const { Business, ...restNext } = clonedTag;

    return {
      message: "Tag clonada com sucesso!",
      status: 200,
      linkTrackingPixel: {
        ...restNext,
        name,
        business: Business.name,
      },
    };
  }
}

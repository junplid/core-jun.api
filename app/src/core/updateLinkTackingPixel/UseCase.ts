import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateLinkTackingPixelDTO_I } from "./DTO";

export class UpdateLinkTackingPixelUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    businessId,
    ...dto
  }: UpdateLinkTackingPixelDTO_I) {
    const exist = await prisma.linkTrackingPixel.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Link não encontrado`,
        type: "error",
      });
    }

    try {
      const { Business } = await prisma.linkTrackingPixel.update({
        where: { id },
        data: { ...dto, businessId },
        select: { Business: { select: { name: true } } },
      });

      return {
        message: "OK!",
        status: 200,
        linkTrackingPixel: { business: Business.name },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar link`,
        type: "error",
      });
    }
  }
}

import { GetFbPixelDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetFbPixelUseCase {
  constructor() {}

  async run(dto: GetFbPixelDTO_I) {
    const fbPixel = await prisma.fbPixel.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      select: {
        name: true,
        businessId: true,
        pixel_id: true,
        access_token: true,
        status: true,
      },
    });

    if (!fbPixel) {
      throw new ErrorResponse(400).toast({
        title: `Pixel não foi encontrado.`,
        type: "error",
      });
    }

    return { message: "OK!", status: 200, fbPixel };
  }
}

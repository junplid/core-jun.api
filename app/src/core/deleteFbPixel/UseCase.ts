import { DeleteFbPixelDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteFbPixelUseCase {
  constructor() {}

  async run(dto: DeleteFbPixelDTO_I) {
    const exist = await prisma.fbPixel.count({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Pixel não encontrado.`,
        type: "error",
      });
    }

    await prisma.fbPixel.delete({ where: { id: dto.id } });

    return { message: "OK!", status: 200 };
  }
}

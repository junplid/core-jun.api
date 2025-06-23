import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateFbPixelDTO_I } from "./DTO";

export class UpdateFbPixelUseCase {
  constructor() {}

  async run({ accountId, id, businessId, ...dto }: UpdateFbPixelDTO_I) {
    const exist = await prisma.fbPixel.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Pixel não encontrado.`,
        type: "error",
      });
    }

    if (dto.name) {
      const existName = await prisma.fbPixel.findFirst({
        where: { accountId, id, name: dto.name },
      });

      if (existName) {
        throw new ErrorResponse(400).toast({
          title: `Já existe um Pixel com esse nome.`,
          type: "error",
        });
      }
    }

    try {
      const { Business } = await prisma.fbPixel.update({
        where: { id },
        data: { ...dto, businessId },
        select: { Business: { select: { name: true, id: true } } },
      });

      return {
        message: "OK!",
        status: 200,
        fbPixel: { business: Business },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar tag!`,
        type: "error",
      });
    }
  }
}

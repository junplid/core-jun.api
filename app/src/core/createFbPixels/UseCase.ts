import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateFbPixelsDTO_I } from "./DTO";

export class CreateFbPixelsUseCase {
  constructor() {}

  async run(dto: CreateFbPixelsDTO_I) {
    const exist = await prisma.fbPixel.findFirst({
      where: {
        accountId: dto.accountId,
        name: dto.name,
        ...(dto.businessId && {
          OR: [{ businessId: dto.businessId }, { businessId: null }],
        }),
      },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe um Pixel com esse nome.`,
      });
    }

    try {
      const { Business, ...rest } = await prisma.fbPixel.create({
        data: dto,
        select: {
          id: true,
          createAt: true,
          Business: { select: { id: true, name: true } },
        },
      });

      return {
        message: "OK!",
        status: 201,
        fbPixel: { ...rest, business: Business },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel criar integrar o Pixel",
        type: "error",
      });
    }
  }
}

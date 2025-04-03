import { GetBusinessDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetBusinessDetailsUseCase {
  constructor() {}

  async run(dto: GetBusinessDetailsDTO_I) {
    const business = await prisma.business.findFirst({
      where: dto,
      select: {
        id: true,
        name: true,
        createAt: true,
        description: true,
        updateAt: true,
      },
    });

    return { message: "OK!", status: 200, business };
  }
}

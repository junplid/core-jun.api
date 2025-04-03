import { GetBusinessIdOnAccountDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetBusinessIdOnAccountUseCase {
  constructor() {}

  async run(dto: GetBusinessIdOnAccountDTO_I) {
    const business = await prisma.business.findFirst({
      where: dto,
      select: { name: true, description: true },
    });

    return { message: "OK", status: 200, business };
  }
}

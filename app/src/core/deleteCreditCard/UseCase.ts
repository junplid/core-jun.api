import { DeleteCreditCardDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteCreditCardUseCase {
  constructor() {}

  async run(dto: DeleteCreditCardDTO_I) {
    await prisma.creditCardsOnAccount.delete({ where: { id: dto.id } });
    return { message: "OK!", status: 201 };
  }
}

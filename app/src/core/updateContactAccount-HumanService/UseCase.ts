import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateContactAccountHumanServiceDTO_I } from "./DTO";

export class UpdateContactAccountHumanServiceUseCase {
  constructor() {}

  async run({
    ticketId,
    userId,
    ...dto
  }: UpdateContactAccountHumanServiceDTO_I) {
    const exist = await prisma.tickets.findFirst({
      where: { sectorsAttendantsId: userId, id: ticketId },
      select: { contactsWAOnAccountId: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Ticket não foi encontrado`,
        type: "error",
      });
    }

    try {
      await prisma.contactsWAOnAccount.update({
        where: { id: exist.contactsWAOnAccountId },
        data: dto,
      });
      return { message: "Nome editado com sucesso!", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar contato`,
        type: "error",
      });
    }
  }
}

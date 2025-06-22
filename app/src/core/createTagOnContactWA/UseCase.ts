import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTagOnContactWADTO_I } from "./DTO";

export class CreateTagOnContactWAUseCase {
  constructor() {}

  async run({ ...dto }: CreateTagOnContactWADTO_I) {
    const exist = await prisma.tag.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      select: { id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).container("Tag não encontrada.").input({
        path: "id",
        text: "Não foi possível encontrar a etiqueta selecionada.",
      });
    }

    let contactWAId: number | null = null;

    if (dto.contactWAId) {
      const contact = await prisma.contactsWAOnAccount.findFirst({
        where: { id: dto.contactWAId, accountId: dto.accountId },
        select: { id: true },
      });

      if (!contact) {
        throw new ErrorResponse(400)
          .container("Contato não encontrado.")
          .input({
            path: "contactWAId",
            text: "Não foi possível encontrar contato informado.",
          });
      }
      contactWAId = contact.id;
    } else if (dto.ticketId) {
      const ticket = await prisma.tickets.findFirst({
        where: { id: dto.ticketId, accountId: dto.accountId },
        select: { ContactsWAOnAccount: { select: { id: true } } },
      });

      if (!ticket || !ticket.ContactsWAOnAccount) {
        throw new ErrorResponse(400).container("Ticket não encontrado.").input({
          path: "ticketId",
          text: "Não foi possível encontrar ticket informado.",
        });
      }
      contactWAId = ticket.ContactsWAOnAccount.id;
    } else {
      throw new ErrorResponse(400).container(
        "Nenhum contato ou ticket informado."
      );
    }

    const existTagOnContact = await prisma.tagOnContactsWAOnAccount.findFirst({
      where: {
        contactsWAOnAccountId: contactWAId,
        tagId: dto.id,
      },
      select: { id: true },
    });

    if (existTagOnContact) {
      return {
        message: "Tag já está associada a este contato.",
        status: 200,
      };
    }

    await prisma.tagOnContactsWAOnAccount.create({
      data: {
        contactsWAOnAccountId: contactWAId,
        tagId: dto.id,
      },
    });
  }
}

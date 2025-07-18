import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateTrelloIntegrationDTO_I } from "./DTO";

export class UpdateTrelloIntegrationUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateTrelloIntegrationDTO_I) {
    const exist = await prisma.trelloIntegration.findFirst({
      where: { accountId, id },
      select: { id: true },
    });
    if (!exist) {
      throw new ErrorResponse(400).container(
        "Integração com trello não encontrada!"
      );
    }

    if (dto.name) {
      const existName = await prisma.trelloIntegration.findFirst({
        where: {
          accountId,
          id: { not: id },
          name: dto.name,
        },
        select: { id: true },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: "Já existe uma integração com esse nome",
        });
      }
    }

    await prisma.trelloIntegration.update({
      where: { id, accountId },
      data: dto,
    });

    return { message: "OK.", status: 200 };
  }
}

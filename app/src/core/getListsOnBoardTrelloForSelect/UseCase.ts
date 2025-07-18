import { GetListsOnBoardTrelloForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { Trello } from "../../adapters/Trello";

export class GetListsOnBoardTrelloForSelectUseCase {
  constructor() {}

  async run({ boardId, ...dto }: GetListsOnBoardTrelloForSelectDTO_I) {
    const integration = await prisma.trelloIntegration.findFirst({
      where: dto,
      select: { key: true, token: true },
    });

    if (!integration) {
      throw new ErrorResponse(404).container(
        "Integração do trello não encontrada."
      );
    }

    const trello = new Trello(integration.key, integration.token);
    try {
      const lists = await trello.listarListasPorQuadro(boardId);
      return {
        message: "OK!",
        status: 200,
        lists,
      };
    } catch (error) {
      throw new ErrorResponse(404).toast({
        title: "Error integração trello",
        type: "error",
        description: "Tentou buscar as listas da integração do trello",
      });
    }
  }
}

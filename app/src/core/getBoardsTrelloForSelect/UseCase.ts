import { GetBoardsTrelloForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { Trello } from "../../adapters/Trello";

export class GetBoardsTrelloForSelectUseCase {
  constructor() {}

  async run(dto: GetBoardsTrelloForSelectDTO_I) {
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
      const boards = await trello.listarQuadros();
      return {
        message: "OK!",
        status: 200,
        boards,
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(404).toast({
        title: "Error integração trello",
        type: "error",
        description: "Tentou buscar quadros da integração do trello",
      });
    }
  }
}

import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetListOfBoardTrelloForSelectDTO_I } from "./DTO";
import { GetListOfBoardTrelloForSelectRepository_I } from "./Repository";

export class GetListOfBoardTrelloForSelectUseCase {
  constructor(private repository: GetListOfBoardTrelloForSelectRepository_I) {}

  async run(dto: GetListOfBoardTrelloForSelectDTO_I) {
    const integration = await this.repository.fetchIntegr({
      accountId: dto.accountId,
      integrationId: dto.integrationId,
    });

    if (!integration) {
      throw new ErrorResponse(400).toast({
        title: `Serviço de integração não foi encontrado`,
        type: "error",
      });
    }

    const listBoard = await this.repository.fetch({
      boardId: dto.boardId,
      ...integration,
    });

    return {
      message: "OK!",
      status: 200,
      listBoard,
    };
  }
}

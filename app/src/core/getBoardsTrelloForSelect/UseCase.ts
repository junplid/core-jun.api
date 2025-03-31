import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetBoardsTrelloForSelectDTO_I } from "./DTO";
import { GetBoardsTrelloForSelectRepository_I } from "./Repository";

export class GetBoardsTrelloForSelectUseCase {
  constructor(private repository: GetBoardsTrelloForSelectRepository_I) {}

  async run(dto: GetBoardsTrelloForSelectDTO_I) {
    const integration = await this.repository.fetchIntegr({
      accountId: dto.accountId,
      integrationId: dto.integrationId,
    });

    if (!integration) {
      throw new ErrorResponse(400)
        .toast({
          title: `Serviço de Integração selecionada não foi encontrada!`,
        })
        .input({
          path: "integrationId",
          text: "Serviço de Integração inválida",
        });
    }

    const boards = await this.repository.fetch({
      memberId: dto.memberId ?? "me",
      ...integration,
    });

    return {
      message: "OK!",
      status: 200,
      boards,
    };
  }
}

import { GetTrelloIntegrationsForSelectController } from "./Controller";
import { GetTrelloIntegrationsForSelectUseCase } from "./UseCase";

export const getTrelloIntegrationsForSelectController =
  GetTrelloIntegrationsForSelectController(
    new GetTrelloIntegrationsForSelectUseCase()
  ).execute;

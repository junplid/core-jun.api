import { GetTrelloIntegrationsController } from "./Controller";
import { GetTrelloIntegrationsUseCase } from "./UseCase";

export const getTrelloIntegrationsController = GetTrelloIntegrationsController(
  new GetTrelloIntegrationsUseCase()
).execute;

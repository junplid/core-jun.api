import { GetTrelloIntegrationController } from "./Controller";
import { GetTrelloIntegrationUseCase } from "./UseCase";

export const getTrelloIntegrationController = GetTrelloIntegrationController(
  new GetTrelloIntegrationUseCase()
).execute;

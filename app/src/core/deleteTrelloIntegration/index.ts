import { DeleteTrelloIntegrationController } from "./Controller";
import { DeleteTrelloIntegrationUseCase } from "./UseCase";

export const deleteTrelloIntegrationController =
  DeleteTrelloIntegrationController(
    new DeleteTrelloIntegrationUseCase()
  ).execute;

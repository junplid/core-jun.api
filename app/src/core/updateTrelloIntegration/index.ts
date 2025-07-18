import { UpdateTrelloIntegrationController } from "./Controller";
import { UpdateTrelloIntegrationUseCase } from "./UseCase";

export const updateTrelloIntegrationController =
  UpdateTrelloIntegrationController(
    new UpdateTrelloIntegrationUseCase()
  ).execute;

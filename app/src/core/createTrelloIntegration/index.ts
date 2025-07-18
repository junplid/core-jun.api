import { CreateTrelloIntegrationController } from "./Controller";
import { CreateTrelloIntegrationUseCase } from "./UseCase";

export const createTrelloIntegrationController =
  CreateTrelloIntegrationController(
    new CreateTrelloIntegrationUseCase()
  ).execute;

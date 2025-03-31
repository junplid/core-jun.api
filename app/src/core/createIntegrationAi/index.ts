import { CreateIntegrationAiController } from "./Controller";
import { CreateIntegrationAiUseCase } from "./UseCase";

export const createIntegrationAiController = CreateIntegrationAiController(
  new CreateIntegrationAiUseCase()
).execute;

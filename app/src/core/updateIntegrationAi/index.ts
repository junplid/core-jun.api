import { UpdateIntegrationAiController } from "./Controller";
import { UpdateIntegrationAiUseCase } from "./UseCase";

export const updateIntegrationAiController = UpdateIntegrationAiController(
  new UpdateIntegrationAiUseCase()
).execute;

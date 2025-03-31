import { DeleteIntegrationAiController } from "./Controller";
import { DeleteIntegrationAiUseCase } from "./UseCase";

export const deleteIntegrationAiController = DeleteIntegrationAiController(
  new DeleteIntegrationAiUseCase()
).execute;

import { UpdateIntegrationController } from "./Controller";
import { UpdateIntegrationUseCase } from "./UseCase";

export const updateIntegrationController = UpdateIntegrationController(
  new UpdateIntegrationUseCase()
).execute;

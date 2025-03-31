import { CloneIntegrationController } from "./Controller";
import { CloneIntegrationUseCase } from "./UseCase";

export const cloneIntegrationController = CloneIntegrationController(
  new CloneIntegrationUseCase()
).execute;

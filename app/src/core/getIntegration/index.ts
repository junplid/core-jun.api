import { GetIntegrationController } from "./Controller";
import { GetIntegrationUseCase } from "./UseCase";

export const getIntegrationController = GetIntegrationController(
  new GetIntegrationUseCase()
).execute;

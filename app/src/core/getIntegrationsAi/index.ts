import { GetIntegrationsAiController } from "./Controller";
import { GetIntegrationsAiUseCase } from "./UseCase";

export const getIntegrationsAiController = GetIntegrationsAiController(
  new GetIntegrationsAiUseCase()
).execute;

import { GetIntegrationAiController } from "./Controller";
import { GetIntegrationAiUseCase } from "./UseCase";

export const getIntegrationAiController = GetIntegrationAiController(
  new GetIntegrationAiUseCase()
).execute;

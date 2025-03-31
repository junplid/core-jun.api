import { GetIntegrationAiForSelectController } from "./Controller";
import { GetIntegrationAiForSelectUseCase } from "./UseCase";

export const getIntegrationAiForSelectController =
  GetIntegrationAiForSelectController(
    new GetIntegrationAiForSelectUseCase()
  ).execute;

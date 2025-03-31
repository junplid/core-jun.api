import { GetIntegrationAiDetailsController } from "./Controller";
import { GetIntegrationAiDetailsUseCase } from "./UseCase";

export const getIntegrationAiDetailsController =
  GetIntegrationAiDetailsController(
    new GetIntegrationAiDetailsUseCase()
  ).execute;

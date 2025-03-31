import { GetPixelsFacebookIntegrationForSelectController } from "./Controller";
import { GetPixelsFacebookIntegrationForSelectUseCase } from "./UseCase";

export const getPixelsFacebookIntegrationForSelectController =
  GetPixelsFacebookIntegrationForSelectController(
    new GetPixelsFacebookIntegrationForSelectUseCase()
  ).execute;

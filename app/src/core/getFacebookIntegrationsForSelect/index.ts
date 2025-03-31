import { GetFacebookIntegrationsForSelectController } from "./Controller";
import { GetFacebookIntegrationsForSelectUseCase } from "./UseCase";

export const getFacebookIntegrationsForSelectController =
  GetFacebookIntegrationsForSelectController(
    new GetFacebookIntegrationsForSelectUseCase()
  ).execute;

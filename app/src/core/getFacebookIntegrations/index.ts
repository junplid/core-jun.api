import { GetFacebookIntegrationsController } from "./Controller";
import { GetFacebookIntegrationsUseCase } from "./UseCase";

export const getFacebookIntegrationsController =
  GetFacebookIntegrationsController(
    new GetFacebookIntegrationsUseCase()
  ).execute;

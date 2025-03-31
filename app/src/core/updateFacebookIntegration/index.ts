import { UpdateFacebookIntegrationController } from "./Controller";
import { UpdateFacebookIntegrationUseCase } from "./UseCase";

export const updateFacebookIntegrationController =
  UpdateFacebookIntegrationController(
    new UpdateFacebookIntegrationUseCase()
  ).execute;

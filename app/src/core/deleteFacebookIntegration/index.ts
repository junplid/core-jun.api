import { DeleteFacebookIntegrationController } from "./Controller";
import { DeleteFacebookIntegrationUseCase } from "./UseCase";

export const deleteFacebookIntegrationController =
  DeleteFacebookIntegrationController(
    new DeleteFacebookIntegrationUseCase()
  ).execute;

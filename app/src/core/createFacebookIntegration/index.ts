import { CreateFacebookIntegrationController } from "./Controller";
import { CreateFacebookIntegrationUseCase } from "./UseCase";

export const createFacebookIntegrationController =
  CreateFacebookIntegrationController(
    new CreateFacebookIntegrationUseCase()
  ).execute;

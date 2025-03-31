import { GetFacebookIntegrationController } from "./Controller";
import { GetFacebookIntegrationUseCase } from "./UseCase";

export const getFacebookIntegrationController =
  GetFacebookIntegrationController(new GetFacebookIntegrationUseCase()).execute;

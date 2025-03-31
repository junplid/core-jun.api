import { GetFacebookIntegrationDetailsController } from "./Controller";
import { GetFacebookIntegrationDetailsUseCase } from "./UseCase";

export const getFacebookIntegrationDetailsController =
  GetFacebookIntegrationDetailsController(
    new GetFacebookIntegrationDetailsUseCase()
  ).execute;

import { GetEmailServiceConfigurationDetailsController } from "./Controller";
import { GetEmailServiceConfigurationDetailsUseCase } from "./UseCase";

export const getEmailServiceConfigurationDetailsController =
  GetEmailServiceConfigurationDetailsController(
    new GetEmailServiceConfigurationDetailsUseCase()
  ).execute;

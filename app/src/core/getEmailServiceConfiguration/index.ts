import { GetEmailServiceConfigurationController } from "./Controller";
import { GetEmailServiceConfigurationUseCase } from "./UseCase";

export const getEmailServiceConfigurationController =
  GetEmailServiceConfigurationController(
    new GetEmailServiceConfigurationUseCase()
  ).execute;

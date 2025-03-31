import { UpdateEmailServiceConfigurationController } from "./Controller";
import { UpdateEmailServiceConfigurationUseCase } from "./UseCase";

export const updateEmailServiceConfigurationController =
  UpdateEmailServiceConfigurationController(
    new UpdateEmailServiceConfigurationUseCase()
  ).execute;

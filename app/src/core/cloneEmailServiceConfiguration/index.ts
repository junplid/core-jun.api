import { CloneEmailServiceConfigurationController } from "./Controller";
import { CloneEmailServiceConfigurationUseCase } from "./UseCase";

export const cloneEmailServiceConfigurationController =
  CloneEmailServiceConfigurationController(
    new CloneEmailServiceConfigurationUseCase()
  ).execute;

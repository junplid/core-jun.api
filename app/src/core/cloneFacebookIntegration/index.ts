import { CloneFacebookIntegrationController } from "./Controller";
import { CloneFacebookIntegrationUseCase } from "./UseCase";

export const cloneFacebookIntegrationController =
  CloneFacebookIntegrationController(
    new CloneFacebookIntegrationUseCase()
  ).execute;

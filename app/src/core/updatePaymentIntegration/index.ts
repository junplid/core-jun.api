import { UpdatePaymentIntegrationController } from "./Controller";
import { UpdatePaymentIntegrationUseCase } from "./UseCase";

export const updatePaymentIntegrationController =
  UpdatePaymentIntegrationController(
    new UpdatePaymentIntegrationUseCase()
  ).execute;

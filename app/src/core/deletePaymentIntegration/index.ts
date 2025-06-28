import { DeletePaymentIntegrationController } from "./Controller";
import { DeletePaymentIntegrationUseCase } from "./UseCase";

export const deletePaymentIntegrationController =
  DeletePaymentIntegrationController(
    new DeletePaymentIntegrationUseCase()
  ).execute;

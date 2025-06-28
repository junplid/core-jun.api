import { GetPaymentIntegrationController } from "./Controller";
import { GetPaymentIntegrationUseCase } from "./UseCase";

export const getPaymentIntegrationController = GetPaymentIntegrationController(
  new GetPaymentIntegrationUseCase()
).execute;

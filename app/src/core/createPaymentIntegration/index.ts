import { CreatePaymentIntegrationController } from "./Controller";
import { CreatePaymentIntegrationUseCase } from "./UseCase";

export const createPaymentIntegrationController =
  CreatePaymentIntegrationController(
    new CreatePaymentIntegrationUseCase()
  ).execute;

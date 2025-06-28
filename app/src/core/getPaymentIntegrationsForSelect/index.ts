import { GetPaymentIntegrationsForSelectController } from "./Controller";
import { GetPaymentIntegrationsForSelectUseCase } from "./UseCase";

export const getPaymentIntegrationsForSelectController =
  GetPaymentIntegrationsForSelectController(
    new GetPaymentIntegrationsForSelectUseCase()
  ).execute;

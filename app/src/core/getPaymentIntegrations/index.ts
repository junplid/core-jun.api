import { GetPaymentIntegrationsController } from "./Controller";
import { GetPaymentIntegrationsUseCase } from "./UseCase";

export const getPaymentIntegrationsController =
  GetPaymentIntegrationsController(new GetPaymentIntegrationsUseCase()).execute;

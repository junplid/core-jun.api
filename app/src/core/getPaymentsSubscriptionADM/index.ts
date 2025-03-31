import { GetPaymentsSubscriptionsADMController } from "./Controller";
import { GetPaymentsSubscriptionsADMUseCase } from "./UseCase";

export const getPaymentsSubscriptionsADMController =
  GetPaymentsSubscriptionsADMController(
    new GetPaymentsSubscriptionsADMUseCase()
  ).execute;

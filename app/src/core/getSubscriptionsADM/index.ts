import { GetSubscriptionsADMController } from "./Controller";
import { GetSubscriptionsADMUseCase } from "./UseCase";

export const getSubscriptionsADMController = GetSubscriptionsADMController(
  new GetSubscriptionsADMUseCase()
).execute;

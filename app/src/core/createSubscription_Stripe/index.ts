import { CreateSubscription_StripeController } from "./Controller";
import { CreateSubscription_StripeUseCase } from "./UseCase";

export const createSubscription_StripeController =
  CreateSubscription_StripeController(
    new CreateSubscription_StripeUseCase(),
  ).execute;

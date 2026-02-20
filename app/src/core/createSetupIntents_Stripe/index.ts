import { CreateSetupIntents_StripeController } from "./Controller";
import { CreateSetupIntents_StripeUseCase } from "./UseCase";

export const createSetupIntents_StripeController =
  CreateSetupIntents_StripeController(
    new CreateSetupIntents_StripeUseCase(),
  ).execute;

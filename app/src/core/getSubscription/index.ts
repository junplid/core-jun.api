import { GetSubscriptionController } from "./Controller";
import { GetSubscriptionUseCase } from "./UseCase";

export const getSubscriptionController = GetSubscriptionController(
  new GetSubscriptionUseCase(),
).execute;

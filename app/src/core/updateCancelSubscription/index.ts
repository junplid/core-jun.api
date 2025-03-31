import { UpdateCancelSubscriptionController } from "./Controller";
import { UpdateCancelSubscriptionUseCase } from "./UseCase";

export const updateCancelSubscriptionController =
  UpdateCancelSubscriptionController(
    new UpdateCancelSubscriptionUseCase()
  ).execute;

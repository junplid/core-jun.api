import { CreatePushTokenController } from "./Controller";
import { CreatePushTokenUseCase } from "./UseCase";

export const createPushTokenController = CreatePushTokenController(
  new CreatePushTokenUseCase()
).execute;

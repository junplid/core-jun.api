import { RegisterIntentController } from "./Controller";
import { RegisterIntentUseCase } from "./UseCase";

export const registerIntentController = RegisterIntentController(
  new RegisterIntentUseCase()
).execute;

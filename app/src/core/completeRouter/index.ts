import { CompleteRouterController } from "./Controller";
import { CompleteRouterUseCase } from "./UseCase";

export const completeRouterController = CompleteRouterController(
  new CompleteRouterUseCase(),
).execute;

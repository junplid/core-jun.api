import { JoinRouterController } from "./Controller";
import { JoinRouterUseCase } from "./UseCase";

export const joinRouterController = JoinRouterController(
  new JoinRouterUseCase(),
).execute;

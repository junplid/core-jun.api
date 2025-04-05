import { GetFlowsController } from "./Controller";
import { GetFlowsUseCase } from "./UseCase";

export const getFlowsController = GetFlowsController(
  new GetFlowsUseCase()
).execute;

import { GetFlowController } from "./Controller";
import { GetFlowUseCase } from "./UseCase";

export const getFlowController = GetFlowController(
  new GetFlowUseCase()
).execute;

import { CreateFlowController } from "./Controller";
import { CreateFlowUseCase } from "./UseCase";

export const createFlowController = CreateFlowController(
  new CreateFlowUseCase()
).execute;

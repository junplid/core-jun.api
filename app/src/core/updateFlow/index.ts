import { UpdateFlowController } from "./Controller";
import { UpdateFlowUseCase } from "./UseCase";

export const updateFlowController = UpdateFlowController(
  new UpdateFlowUseCase()
).execute;

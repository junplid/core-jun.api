import { UpdateDataFlowController } from "./Controller";
import { UpdateDataFlowUseCase } from "./UseCase";

export const updateDataFlowController = UpdateDataFlowController(
  new UpdateDataFlowUseCase()
).execute;

import { CraeteFlowImplementation } from "./Implementation";
import { UpdateDataFlowController } from "./Controller";
import { UpdateDataFlowUseCase } from "./UseCase";

const updateDataFlowImplementation = new CraeteFlowImplementation();
const updateDataFlowUseCase = new UpdateDataFlowUseCase(
  updateDataFlowImplementation
);

export const updateDataFlowController = UpdateDataFlowController(
  updateDataFlowUseCase
).execute;

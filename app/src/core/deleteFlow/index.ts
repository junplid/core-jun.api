import { DeleteFlowImplementation } from "./Implementation";
import { DeleteFlowController } from "./Controller";
import { DeleteFlowUseCase } from "./UseCase";

const deleteFlowImplementation = new DeleteFlowImplementation();
const deleteFlowUseCase = new DeleteFlowUseCase(deleteFlowImplementation);

export const deleteFlowController =
  DeleteFlowController(deleteFlowUseCase).execute;

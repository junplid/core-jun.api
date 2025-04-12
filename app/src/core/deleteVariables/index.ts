import { DeleteVariableController } from "./Controller";
import { DeleteVariableUseCase } from "./UseCase";

export const deleteVariableController = DeleteVariableController(
  new DeleteVariableUseCase()
).execute;

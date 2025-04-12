import { UpdateVariableController } from "./Controller";
import { UpdateVariableUseCase } from "./UseCase";

export const updateVariableController = UpdateVariableController(
  new UpdateVariableUseCase()
).execute;

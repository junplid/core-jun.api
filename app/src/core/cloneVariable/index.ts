import { CloneVariableController } from "./Controller";
import { CloneVariableUseCase } from "./UseCase";

export const cloneVariableController = CloneVariableController(
  new CloneVariableUseCase()
).execute;

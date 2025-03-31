import { CreateVariableController } from "./Controller";
import { CreateVariableUseCase } from "./UseCase";

export const createVariableController = CreateVariableController(
  new CreateVariableUseCase()
).execute;

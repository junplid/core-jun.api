import { GetVariableController } from "./Controller";
import { GetVariableUseCase } from "./UseCase";

export const getVariableController = GetVariableController(
  new GetVariableUseCase()
).execute;

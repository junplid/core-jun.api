import { GetVariableBusinessController } from "./Controller";
import { GetVariableBusinessUseCase } from "./UseCase";

export const getVariableBusinessController = GetVariableBusinessController(
  new GetVariableBusinessUseCase()
).execute;

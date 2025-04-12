import { GetVariableForSelectController } from "./Controller";
import { GetVariableForSelectUseCase } from "./UseCase";

export const getVariableForSelectController = GetVariableForSelectController(
  new GetVariableForSelectUseCase()
).execute;

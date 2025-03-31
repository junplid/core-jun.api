import { GetVariableDetailsController } from "./Controller";
import { GetVariableDetailsUseCase } from "./UseCase";

export const getVariableDetailsController = GetVariableDetailsController(
  new GetVariableDetailsUseCase()
).execute;

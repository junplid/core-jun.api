import { GetVariableHumanServiceAutoCompleteController } from "./Controller";
import { GetVariableHumanServiceAutoCompleteUseCase } from "./UseCase";

export const getVariableHumanServiceAutoCompleteController =
  GetVariableHumanServiceAutoCompleteController(
    new GetVariableHumanServiceAutoCompleteUseCase()
  ).execute;

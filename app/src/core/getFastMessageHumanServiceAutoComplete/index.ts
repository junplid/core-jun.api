import { GetFastMessageHumanServiceAutoCompleteController } from "./Controller";
import { GetFastMessageHumanServiceAutoCompleteUseCase } from "./UseCase";

export const getFastMessageHumanServiceAutoCompleteController =
  GetFastMessageHumanServiceAutoCompleteController(
    new GetFastMessageHumanServiceAutoCompleteUseCase()
  ).execute;

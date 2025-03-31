import { GetFastMessageHumanServiceController } from "./Controller";
import { GetFastMessageHumanServiceUseCase } from "./UseCase";

export const getFastMessageHumanServiceController =
  GetFastMessageHumanServiceController(
    new GetFastMessageHumanServiceUseCase()
  ).execute;

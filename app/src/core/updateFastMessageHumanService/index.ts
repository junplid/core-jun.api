import { UpdateFastMessageHumanServiceController } from "./Controller";
import { UpdateFastMessageHumanServiceUseCase } from "./UseCase";

export const updateFastMessageHumanServiceController =
  UpdateFastMessageHumanServiceController(
    new UpdateFastMessageHumanServiceUseCase()
  ).execute;

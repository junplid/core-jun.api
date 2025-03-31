import { CreateFastMessageHumanServiceController } from "./Controller";
import { CreateFastMessageHumanServiceUseCase } from "./UseCase";

export const createFastMessageHumanServiceController =
  CreateFastMessageHumanServiceController(
    new CreateFastMessageHumanServiceUseCase()
  ).execute;

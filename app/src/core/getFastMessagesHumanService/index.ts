import { GetFastMessagesHumanServiceController } from "./Controller";
import { GetFastMessagesHumanServiceUseCase } from "./UseCase";

export const getFastMessagesHumanServiceController =
  GetFastMessagesHumanServiceController(
    new GetFastMessagesHumanServiceUseCase()
  ).execute;

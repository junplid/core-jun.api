import { GetFastMessagesHumanServiceForSelectController } from "./Controller";
import { GetFastMessagesHumanServiceForSelectUseCase } from "./UseCase";

export const getFastMessagesHumanServiceForSelectController =
  GetFastMessagesHumanServiceForSelectController(
    new GetFastMessagesHumanServiceForSelectUseCase()
  ).execute;

import { GetFastMessageHumanDetailsServiceController } from "./Controller";
import { GetFastMessageHumanDetailsServiceUseCase } from "./UseCase";

export const getFastMessageHumanDetailsServiceController =
  GetFastMessageHumanDetailsServiceController(
    new GetFastMessageHumanDetailsServiceUseCase()
  ).execute;

import { GetGeolocationHumanServiceForSelectController } from "./Controller";
import { GetGeolocationHumanServiceForSelectUseCase } from "./UseCase";

export const getGeolocationHumanServiceForSelectController =
  GetGeolocationHumanServiceForSelectController(
    new GetGeolocationHumanServiceForSelectUseCase()
  ).execute;

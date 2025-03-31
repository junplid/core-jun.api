import { GetGeolocationForSelectController } from "./Controller";
import { GetGeolocationForSelectUseCase } from "./UseCase";

export const getGeolocationForSelectController =
  GetGeolocationForSelectController(
    new GetGeolocationForSelectUseCase()
  ).execute;

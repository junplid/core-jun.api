import { GetGeolocationController } from "./Controller";
import { GetGeolocationUseCase } from "./UseCase";

export const getGeolocationController = GetGeolocationController(
  new GetGeolocationUseCase()
).execute;

import { GetGeolocationDetailsController } from "./Controller";
import { GetGeolocationDetailsUseCase } from "./UseCase";

export const getGeolocationDetailsController = GetGeolocationDetailsController(
  new GetGeolocationDetailsUseCase()
).execute;

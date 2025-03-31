import { GetGeolocationsController } from "./Controller";
import { GetGeolocationsUseCase } from "./UseCase";

export const getGeolocationsController = GetGeolocationsController(
  new GetGeolocationsUseCase()
).execute;

import { CreateGeolocationBusinessController } from "./Controller";
import { CreateGeolocationBusinessUseCase } from "./UseCase";

export const createGeolocationBusinessController =
  CreateGeolocationBusinessController(
    new CreateGeolocationBusinessUseCase()
  ).execute;

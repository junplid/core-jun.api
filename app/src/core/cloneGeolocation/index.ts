import { CloneGeolocationController } from "./Controller";
import { CloneGeolocationUseCase } from "./UseCase";

export const cloneGeolocationController = CloneGeolocationController(
  new CloneGeolocationUseCase()
).execute;

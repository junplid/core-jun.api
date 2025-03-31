import { UpdateGeolocationController } from "./Controller";
import { UpdateGeolocationUseCase } from "./UseCase";

export const updateGeolocationController = UpdateGeolocationController(
  new UpdateGeolocationUseCase()
).execute;

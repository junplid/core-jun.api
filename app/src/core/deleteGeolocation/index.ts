import { DeleteGeolocationController } from "./Controller";
import { DeleteGeolocationUseCase } from "./UseCase";

export const deleteGeolocationController = DeleteGeolocationController(
  new DeleteGeolocationUseCase()
).execute;

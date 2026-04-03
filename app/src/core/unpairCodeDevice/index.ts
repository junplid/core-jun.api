import { UnpairCodeDeviceController } from "./Controller";
import { UnpairCodeDeviceUseCase } from "./UseCase";

export const unpairCodeDeviceController = UnpairCodeDeviceController(
  new UnpairCodeDeviceUseCase(),
).execute;

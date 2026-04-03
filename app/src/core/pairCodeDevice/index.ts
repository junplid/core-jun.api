import { PairCodeDeviceController } from "./Controller";
import { PairCodeDeviceUseCase } from "./UseCase";

export const pairCodeDeviceController = PairCodeDeviceController(
  new PairCodeDeviceUseCase(),
).execute;

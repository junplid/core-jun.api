import { UpdateFbPixelController } from "./Controller";
import { UpdateFbPixelUseCase } from "./UseCase";

export const updateFbPixelController = UpdateFbPixelController(
  new UpdateFbPixelUseCase()
).execute;

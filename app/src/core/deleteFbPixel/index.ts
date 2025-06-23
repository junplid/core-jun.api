import { DeleteFbPixelController } from "./Controller";
import { DeleteFbPixelUseCase } from "./UseCase";

export const deleteFbPixelController = DeleteFbPixelController(
  new DeleteFbPixelUseCase()
).execute;

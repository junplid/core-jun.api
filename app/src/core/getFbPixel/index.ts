import { GetFbPixelController } from "./Controller";
import { GetFbPixelUseCase } from "./UseCase";

export const getFbPixelController = GetFbPixelController(
  new GetFbPixelUseCase()
).execute;

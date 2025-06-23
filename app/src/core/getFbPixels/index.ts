import { GetFbPixelsController } from "./Controller";
import { GetFbPixelsUseCase } from "./UseCase";

export const getFbPixelsController = GetFbPixelsController(
  new GetFbPixelsUseCase()
).execute;

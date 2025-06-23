import { GetFbPixelsForSelectController } from "./Controller";
import { GetFbPixelsForSelectUseCase } from "./UseCase";

export const getFbPixelsForSelectController = GetFbPixelsForSelectController(
  new GetFbPixelsForSelectUseCase()
).execute;

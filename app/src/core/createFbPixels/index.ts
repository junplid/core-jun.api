import { CreateFbPixelsController } from "./Controller";
import { CreateFbPixelsUseCase } from "./UseCase";

export const createFbPixelsController = CreateFbPixelsController(
  new CreateFbPixelsUseCase()
).execute;

import { GetStorageFilesController } from "./Controller";
import { GetStorageFilesUseCase } from "./UseCase";

export const getStorageFilesController = GetStorageFilesController(
  new GetStorageFilesUseCase()
).execute;

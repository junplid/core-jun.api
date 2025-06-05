import { GetStorageFileController } from "./Controller";
import { GetStorageFileUseCase } from "./UseCase";

export const getStorageFileController = GetStorageFileController(
  new GetStorageFileUseCase()
).execute;

import { CreateStorageFileController } from "./Controller";
import { CreateStorageFileUseCase } from "./UseCase";

export const createStorageFileController = CreateStorageFileController(
  new CreateStorageFileUseCase()
).execute;

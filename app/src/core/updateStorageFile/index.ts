import { UpdateStorageFileController } from "./Controller";
import { UpdateStorageFileUseCase } from "./UseCase";

export const updateStorageFileController = UpdateStorageFileController(
  new UpdateStorageFileUseCase()
).execute;

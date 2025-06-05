import { DeleteStorageFileController } from "./Controller";
import { DeleteStorageFileUseCase } from "./UseCase";

export const deleteStorageFileController = DeleteStorageFileController(
  new DeleteStorageFileUseCase()
).execute;

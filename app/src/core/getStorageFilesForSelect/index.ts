import { GetStorageFilesForSelectController } from "./Controller";
import { GetStorageFilesForSelectUseCase } from "./UseCase";

export const getStorageFilesForSelectController =
  GetStorageFilesForSelectController(
    new GetStorageFilesForSelectUseCase()
  ).execute;

import { GetConnectionsWAForSelectController } from "./Controller";
import { GetConnectionsWAForSelectUseCase } from "./UseCase";

export const getConnectionsWAForSelectController =
  GetConnectionsWAForSelectController(
    new GetConnectionsWAForSelectUseCase()
  ).execute;

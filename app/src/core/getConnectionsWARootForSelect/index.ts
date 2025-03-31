import { GetConnectionsWARootForSelectController } from "./Controller";
import { GetConnectionsWARootForSelectUseCase } from "./UseCase";

export const getConnectionsWARootForSelectController =
  GetConnectionsWARootForSelectController(
    new GetConnectionsWARootForSelectUseCase()
  ).execute;

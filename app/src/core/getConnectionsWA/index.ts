import { GetConnectionsWAController } from "./Controller";
import { GetConnectionsWAUseCase } from "./UseCase";

export const getConnectionsWAController = GetConnectionsWAController(
  new GetConnectionsWAUseCase()
).execute;

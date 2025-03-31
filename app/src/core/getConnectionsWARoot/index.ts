import { GetConnectionsWARootController } from "./Controller";
import { GetConnectionsWARootUseCase } from "./UseCase";

export const getConnectionsWARootController = GetConnectionsWARootController(
  new GetConnectionsWARootUseCase()
).execute;

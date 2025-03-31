import { CreateConnectionsWARootController } from "./Controller";
import { CreateConnectionsWARootUseCase } from "./UseCase";

export const createConnectionsWARootController =
  CreateConnectionsWARootController(
    new CreateConnectionsWARootUseCase()
  ).execute;

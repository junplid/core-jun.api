import { CreateConnectionWAController } from "./Controller";
import { CreateConnectionWAUseCase } from "./UseCase";

export const createConnectionWAController = CreateConnectionWAController(
  new CreateConnectionWAUseCase()
).execute;

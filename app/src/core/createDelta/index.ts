import { CreateDeltaController } from "./Controller";
import { CreateDeltaUseCase } from "./UseCase";

export const createDeltaController = CreateDeltaController(
  new CreateDeltaUseCase(),
).execute;

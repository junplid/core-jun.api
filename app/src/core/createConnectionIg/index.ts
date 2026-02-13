import { CreateConnectionIgController } from "./Controller";
import { CreateConnectionIgUseCase } from "./UseCase";

export const createConnectionIgController = CreateConnectionIgController(
  new CreateConnectionIgUseCase(),
).execute;

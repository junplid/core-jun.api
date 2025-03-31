import { CreateCloneConnectionWaController } from "./Controller";
import { CreateCloneConnectionWaUseCase } from "./UseCase";

export const createCloneConnectionWaController =
  CreateCloneConnectionWaController(
    new CreateCloneConnectionWaUseCase()
  ).execute;

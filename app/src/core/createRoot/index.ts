import { CreateRootController } from "./Controller";
import { CreateRootUseCase } from "./UseCase";

export const createRootController = CreateRootController(
  new CreateRootUseCase()
).execute;

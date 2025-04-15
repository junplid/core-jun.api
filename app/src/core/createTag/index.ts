import { CreateTagController } from "./Controller";
import { CreateTagUseCase } from "./UseCase";

export const createTagController = CreateTagController(
  new CreateTagUseCase()
).execute;

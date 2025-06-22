import { CreateTagOnContactWAController } from "./Controller";
import { CreateTagOnContactWAUseCase } from "./UseCase";

export const createTagOnContactWAController = CreateTagOnContactWAController(
  new CreateTagOnContactWAUseCase()
).execute;

import { CreateTemplateController } from "./Controller";
import { CreateTemplateUseCase } from "./UseCase";

export const createTemplateController = CreateTemplateController(
  new CreateTemplateUseCase(),
).execute;

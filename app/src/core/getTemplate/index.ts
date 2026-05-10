import { GetTemplateController } from "./Controller";
import { GetTemplateUseCase } from "./UseCase";

export const getTemplateController = GetTemplateController(
  new GetTemplateUseCase(),
).execute;

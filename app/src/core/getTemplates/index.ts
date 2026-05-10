import { GetTemplatesController } from "./Controller";
import { GetTemplatesUseCase } from "./UseCase";

export const getTemplatesController = GetTemplatesController(
  new GetTemplatesUseCase(),
).execute;

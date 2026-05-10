import { CreateTemplate_root_Controller } from "./Controller";
import { CreateTemplate_root_UseCase } from "./UseCase";

export const createTemplate_root_Controller = CreateTemplate_root_Controller(
  new CreateTemplate_root_UseCase(),
).execute;

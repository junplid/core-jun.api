import { GetTemplates_root_Controller } from "./Controller";
import { GetTemplates_root_UseCase } from "./UseCase";

export const getTemplates_root_Controller = GetTemplates_root_Controller(
  new GetTemplates_root_UseCase(),
).execute;

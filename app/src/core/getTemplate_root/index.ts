import { GetTemplate_root_Controller } from "./Controller";
import { GetTemplate_root_UseCase } from "./UseCase";

export const getTemplate_root_Controller = GetTemplate_root_Controller(
  new GetTemplate_root_UseCase(),
).execute;

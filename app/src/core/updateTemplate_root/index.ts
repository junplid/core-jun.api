import { UpdateTemplate_root_Controller } from "./Controller";
import { UpdateTemplate_root_UseCase } from "./UseCase";

export const updateTemplate_root_Controller = UpdateTemplate_root_Controller(
  new UpdateTemplate_root_UseCase(),
).execute;

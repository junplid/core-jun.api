import { UpdateAgentTemplate_root_Controller } from "./Controller";
import { UpdateAgentTemplate_root_UseCase } from "./UseCase";

export const updateAgentTemplate_root_Controller =
  UpdateAgentTemplate_root_Controller(
    new UpdateAgentTemplate_root_UseCase(),
  ).execute;

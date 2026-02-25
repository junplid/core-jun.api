import { CreateAgentTemplate_root_Controller } from "./Controller";
import { CreateAgentTemplate_root_UseCase } from "./UseCase";

export const createAgentTemplate_root_Controller =
  CreateAgentTemplate_root_Controller(
    new CreateAgentTemplate_root_UseCase(),
  ).execute;

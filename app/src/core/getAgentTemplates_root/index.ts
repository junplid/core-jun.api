import { GetAgentTemplates_root_Controller } from "./Controller";
import { GetAgentTemplates_root_UseCase } from "./UseCase";

export const getAgentTemplates_root_Controller =
  GetAgentTemplates_root_Controller(
    new GetAgentTemplates_root_UseCase(),
  ).execute;

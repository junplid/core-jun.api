import { GetAgentTemplate_root_Controller } from "./Controller";
import { GetAgentTemplate_root_UseCase } from "./UseCase";

export const getAgentTemplate_root_Controller =
  GetAgentTemplate_root_Controller(new GetAgentTemplate_root_UseCase()).execute;

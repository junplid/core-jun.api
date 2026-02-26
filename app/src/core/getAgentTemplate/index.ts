import { GetAgentTemplateController } from "./Controller";
import { GetAgentTemplateUseCase } from "./UseCase";

export const getAgentTemplateController = GetAgentTemplateController(
  new GetAgentTemplateUseCase(),
).execute;

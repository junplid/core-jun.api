import { CreateAgentTemplateController } from "./Controller";
import { CreateAgentTemplateUseCase } from "./UseCase";

export const createAgentTemplateController = CreateAgentTemplateController(
  new CreateAgentTemplateUseCase(),
).execute;

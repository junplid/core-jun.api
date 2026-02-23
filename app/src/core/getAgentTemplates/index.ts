import { GetAgentTemplatesController } from "./Controller";
import { GetAgentTemplatesUseCase } from "./UseCase";

export const getAgentTemplatesController = GetAgentTemplatesController(
  new GetAgentTemplatesUseCase(),
).execute;

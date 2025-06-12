import { GetAgentsAIForSelectController } from "./Controller";
import { GetAgentsAIForSelectUseCase } from "./UseCase";

export const getAgentsAIForSelectController = GetAgentsAIForSelectController(
  new GetAgentsAIForSelectUseCase()
).execute;

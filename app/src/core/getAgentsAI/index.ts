import { GetAgentsAIController } from "./Controller";
import { GetAgentsAIUseCase } from "./UseCase";

export const getAgentsAIController = GetAgentsAIController(
  new GetAgentsAIUseCase()
).execute;

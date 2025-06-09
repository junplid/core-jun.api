import { GetAgentAIController } from "./Controller";
import { GetAgentAIUseCase } from "./UseCase";

export const getAgentAIController = GetAgentAIController(
  new GetAgentAIUseCase()
).execute;

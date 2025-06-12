import { UpdateAgentAIController } from "./Controller";
import { UpdateAgentAIUseCase } from "./UseCase";

export const updateAgentAIController = UpdateAgentAIController(
  new UpdateAgentAIUseCase()
).execute;

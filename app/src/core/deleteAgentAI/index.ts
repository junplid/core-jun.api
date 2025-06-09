import { DeleteAgentAIController } from "./Controller";
import { DeleteAgentAIUseCase } from "./UseCase";

export const deleteAgentAIController = DeleteAgentAIController(
  new DeleteAgentAIUseCase()
).execute;

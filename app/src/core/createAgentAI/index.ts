import { CreateAgentAIController } from "./Controller";
import { CreateAgentAIUseCase } from "./UseCase";

export const createAgentAIController = CreateAgentAIController(
  new CreateAgentAIUseCase()
).execute;

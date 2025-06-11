import { TestAgentAIController } from "./Controller";
import { TestAgentAIUseCase } from "./UseCase";

export const testAgentAIController = TestAgentAIController(
  new TestAgentAIUseCase()
).execute;

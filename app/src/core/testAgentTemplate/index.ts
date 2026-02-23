import { TestAgentTemplateController } from "./Controller";
import { TestAgentTemplateUseCase } from "./UseCase";

export const testAgentTemplateController = TestAgentTemplateController(
  new TestAgentTemplateUseCase(),
).execute;

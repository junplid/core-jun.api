import { CreateCloneChatbotController } from "./Controller";
import { CreateCloneChatbotUseCase } from "./UseCase";

export const createCloneChatbotController = CreateCloneChatbotController(
  new CreateCloneChatbotUseCase()
).execute;

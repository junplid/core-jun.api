import { CreateChatbotController } from "./Controller";
import { CreateChatbotUseCase } from "./UseCase";

export const createChatbotController = CreateChatbotController(
  new CreateChatbotUseCase()
).execute;

import { GetChatbotController } from "./Controller";
import { GetChatbotUseCase } from "./UseCase";

export const getChatbotController = GetChatbotController(
  new GetChatbotUseCase()
).execute;

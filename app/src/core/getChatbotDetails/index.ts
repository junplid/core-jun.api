import { GetChatbotDetailsController } from "./Controller";
import { GetChatbotDetailsUseCase } from "./UseCase";

export const getChatbotDetailsController = GetChatbotDetailsController(
  new GetChatbotDetailsUseCase()
).execute;

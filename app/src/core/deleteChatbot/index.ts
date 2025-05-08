import { DeleteChatbotController } from "./Controller";
import { DeleteChatbotUseCase } from "./UseCase";

export const deleteChatbotController = DeleteChatbotController(
  new DeleteChatbotUseCase()
).execute;

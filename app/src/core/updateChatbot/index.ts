import { UpdateChatbotController } from "./Controller";
import { UpdateChatbotUseCase } from "./UseCase";

export const updateChatbotController = UpdateChatbotController(
  new UpdateChatbotUseCase()
).execute;

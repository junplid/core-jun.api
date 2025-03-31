import { DeleteChatbotImplementation } from "./Implementation";
import { DeleteChatbotController } from "./Controller";
import { DeleteChatbotUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteChatbotImplementation = new DeleteChatbotImplementation(prisma);
const deleteChatbotUseCase = new DeleteChatbotUseCase(
  deleteChatbotImplementation
);

export const deleteChatbotController =
  DeleteChatbotController(deleteChatbotUseCase).execute;

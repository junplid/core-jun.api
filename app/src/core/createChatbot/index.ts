import { CraeteSectorImplementation } from "./Implementation";
import { CreateChatbotController } from "./Controller";
import { CreateChatbotUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createChatbotImplementation = new CraeteSectorImplementation(prisma);

const createChatbotUseCase = new CreateChatbotUseCase(
  createChatbotImplementation
);

export const createChatbotController =
  CreateChatbotController(createChatbotUseCase).execute;

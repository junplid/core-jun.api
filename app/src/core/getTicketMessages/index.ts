import { prisma } from "../../adapters/Prisma/client";
import { GetTicketMessagesController } from "./Controller";
import { GetTicketMessagesImplementation } from "./Implementation";
import { GetTicketMessagesUseCase } from "./UseCase";

const getTicketMessagesImplementation = new GetTicketMessagesImplementation(
  prisma
);
const getTicketMessagesUseCase = new GetTicketMessagesUseCase(
  getTicketMessagesImplementation
);

export const getTicketMessagesController = GetTicketMessagesController(
  getTicketMessagesUseCase
).execute;

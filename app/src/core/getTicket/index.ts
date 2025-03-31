import { prisma } from "../../adapters/Prisma/client";
import { GetTicketController } from "./Controller";
import { GetTicketImplementation } from "./Implementation";
import { GetTicketUseCase } from "./UseCase";

const getTicketImplementation = new GetTicketImplementation(prisma);
const getTicketUseCase = new GetTicketUseCase(getTicketImplementation);

export const getTicketController =
  GetTicketController(getTicketUseCase).execute;

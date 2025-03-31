import { GetTicketsImplementation } from "./Implementation";
import { GetTicketsController } from "./Controller";
import { GetTicketsUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getTicketsImplementation = new GetTicketsImplementation(prisma);
const getTicketsUseCase = new GetTicketsUseCase(getTicketsImplementation);

export const getTicketsController =
  GetTicketsController(getTicketsUseCase).execute;

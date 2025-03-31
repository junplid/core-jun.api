import { GetChabotsImplementation } from "./Implementation";
import { GetChabotsController } from "./Controller";
import { GetChabotsUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getChabotsImplementation = new GetChabotsImplementation(prisma);
const getChabotsUseCase = new GetChabotsUseCase(getChabotsImplementation);

export const getChabotsController =
  GetChabotsController(getChabotsUseCase).execute;

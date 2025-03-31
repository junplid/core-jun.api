import { GetChabotsForSelectImplementation } from "./Implementation";
import { GetChabotsForSelectController } from "./Controller";
import { GetChabotsForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getChabotsForSelectImplementation = new GetChabotsForSelectImplementation(
  prisma
);
const getChabotsForSelectUseCase = new GetChabotsForSelectUseCase(
  getChabotsForSelectImplementation
);

export const getChabotsForSelectController = GetChabotsForSelectController(
  getChabotsForSelectUseCase
).execute;

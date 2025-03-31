import { CreateCheckPointImplementation } from "./Implementation";
import { CreateCheckPointController } from "./Controller";
import { CreateCheckPointUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createCheckPointImplementation = new CreateCheckPointImplementation(
  prisma
);
const createCheckPointUseCase = new CreateCheckPointUseCase(
  createCheckPointImplementation
);

export const createCheckPointController = CreateCheckPointController(
  createCheckPointUseCase
).execute;

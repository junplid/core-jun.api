import { prisma } from "../../adapters/Prisma/client";
import { CreateSubAccountController } from "./Controller";
import { CraeteSubAccountImplementation } from "./Implementation";
import { CreateSubAccountUseCase } from "./UseCase";

const createSubAccountImplementation = new CraeteSubAccountImplementation(
  prisma
);
const createSubAccountUseCase = new CreateSubAccountUseCase(
  createSubAccountImplementation
);

export const createSubAccountController = CreateSubAccountController(
  createSubAccountUseCase
).execute;

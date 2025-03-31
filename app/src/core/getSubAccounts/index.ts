import { prisma } from "../../adapters/Prisma/client";
import { GetSubAccountsController } from "./Controller";
import { GetSubAccountsImplementation } from "./Implementation";
import { GetSubAccountsUseCase } from "./UseCase";

const getSubAccountsImplementation = new GetSubAccountsImplementation(prisma);
const getSubAccountsUseCase = new GetSubAccountsUseCase(
  getSubAccountsImplementation
);

export const getSubAccountsController = GetSubAccountsController(
  getSubAccountsUseCase
).execute;

import { CreateAuthorizationAccountImplementation } from "./Implementation";
import { CreateAuthorizationAccountController } from "./Controller";
import { CreateAuthorizationAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createAuthorizationAccountImplementation =
  new CreateAuthorizationAccountImplementation(prisma);
const createAuthorizationAccountUseCase = new CreateAuthorizationAccountUseCase(
  createAuthorizationAccountImplementation
);

export const createAuthorizationAccountController =
  CreateAuthorizationAccountController(
    createAuthorizationAccountUseCase
  ).execute;

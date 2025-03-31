import { prisma } from "../../adapters/Prisma/client";
import { LoginAccountController } from "./Controller";
import { LoginAccountImplementation } from "./Implementation";
import { LoginAccountUseCase } from "./UseCase";

const loginAccountImplementation = new LoginAccountImplementation(prisma);
const loginAccountUseCase = new LoginAccountUseCase(loginAccountImplementation);

export const loginAccountController =
  LoginAccountController(loginAccountUseCase).execute;

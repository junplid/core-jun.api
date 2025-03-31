import { GetAuthorizationAccountImplementation } from "./Implementation";
import { GetAuthorizationAccountController } from "./Controller";
import { GetAuthorizationAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getAuthorizationAccountImplementation =
  new GetAuthorizationAccountImplementation(prisma);
const getAuthorizationAccountUseCase = new GetAuthorizationAccountUseCase(
  getAuthorizationAccountImplementation
);

export const getAuthorizationAccountController =
  GetAuthorizationAccountController(getAuthorizationAccountUseCase).execute;

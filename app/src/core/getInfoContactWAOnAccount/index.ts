import { GetContactWAOnAccountOnAccountImplementation } from "./Implementation";
import { GetContactWAOnAccountController } from "./Controller";
import { GetContactWAOnAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getContactWAOnAccountImplementation =
  new GetContactWAOnAccountOnAccountImplementation(prisma);
const getContactWAOnAccountUseCase = new GetContactWAOnAccountUseCase(
  getContactWAOnAccountImplementation
);

export const getContactWAOnAccountController = GetContactWAOnAccountController(
  getContactWAOnAccountUseCase
).execute;

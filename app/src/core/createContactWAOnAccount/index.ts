import { CreateContactWAOnAccountImplementation } from "./Implementation";
import { CreateContactWAOnAccountOnAccountController } from "./Controller";
import { CreateContactWAOnAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createContactWAOnAccountImplementation =
  new CreateContactWAOnAccountImplementation(prisma);
const createContactWAOnAccountUseCase = new CreateContactWAOnAccountUseCase(
  createContactWAOnAccountImplementation
);

export const createContactWAOnAccountController =
  CreateContactWAOnAccountOnAccountController(
    createContactWAOnAccountUseCase
  ).execute;

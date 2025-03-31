import { prisma } from "../../adapters/Prisma/client";
import { LoginRootController } from "./Controller";
import { LoginRootImplementation } from "./Implementation";
import { LoginRootUseCase } from "./UseCase";

const loginRootImplementation = new LoginRootImplementation(prisma);
const loginRootUseCase = new LoginRootUseCase(loginRootImplementation);

export const loginRootController =
  LoginRootController(loginRootUseCase).execute;

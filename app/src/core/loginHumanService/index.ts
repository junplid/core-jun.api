import { prisma } from "../../adapters/Prisma/client";
import { LoginHumanServiceController } from "./Controller";
import { LoginHumanServiceImplementation } from "./Implementation";
import { LoginHumanServiceUseCase } from "./UseCase";

const loginHumanServiceImplementation = new LoginHumanServiceImplementation(
  prisma
);
const loginHumanServiceUseCase = new LoginHumanServiceUseCase(
  loginHumanServiceImplementation
);

export const loginHumanServiceController = LoginHumanServiceController(
  loginHumanServiceUseCase
).execute;

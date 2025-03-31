import { CraeteCompanyImplementation } from "./Implementation";
import { CreateParameterController } from "./Controller";
import { CreateParameterUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createParameterImplementation = new CraeteCompanyImplementation(prisma);
const createParameterUseCase = new CreateParameterUseCase(
  createParameterImplementation
);

export const createParameterController = CreateParameterController(
  createParameterUseCase
).execute;

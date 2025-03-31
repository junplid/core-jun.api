import { prisma } from "../../adapters/Prisma/client";
import { GetVariablesContactAccountController } from "./Controller";
import { GetVariablesContactAccountImplementation } from "./Implementation";
import { GetVariablesContactAccountUseCase } from "./UseCase";

const getVariablesContactAccountImplementation =
  new GetVariablesContactAccountImplementation(prisma);
const getVariablesContactAccountUseCase = new GetVariablesContactAccountUseCase(
  getVariablesContactAccountImplementation
);

export const getVariablesContactAccountController =
  GetVariablesContactAccountController(
    getVariablesContactAccountUseCase
  ).execute;

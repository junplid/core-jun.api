import { prisma } from "../../adapters/Prisma/client";
import { GetVariablesForSelectHumanServiceController } from "./Controller";
import { GetVariablesForSelectHumanServiceImplementation } from "./Implementation";
import { GetVariablesForSelectHumanServiceUseCase } from "./UseCase";

const getVariablesForSelectHumanServiceImplementation =
  new GetVariablesForSelectHumanServiceImplementation(prisma);
const getVariablesForSelectHumanServiceUseCase =
  new GetVariablesForSelectHumanServiceUseCase(
    getVariablesForSelectHumanServiceImplementation
  );

export const getVariablesForSelectHumanServiceController =
  GetVariablesForSelectHumanServiceController(
    getVariablesForSelectHumanServiceUseCase
  ).execute;

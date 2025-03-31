import { GetAffiliatesImplementation } from "./Implementation";
import { GetAffiliatesController } from "./Controller";
import { GetAffiliatesUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getAffiliatesImplementation = new GetAffiliatesImplementation(prisma);
const getAffiliatesUseCase = new GetAffiliatesUseCase(
  getAffiliatesImplementation
);

export const getAffiliatesController =
  GetAffiliatesController(getAffiliatesUseCase).execute;

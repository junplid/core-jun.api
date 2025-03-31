import { DeleteAffiliatesImplementation } from "./Implementation";
import { DeleteAffiliatesController } from "./Controller";
import { DeleteAffiliatesUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteAffiliatesImplementation = new DeleteAffiliatesImplementation(
  prisma
);
const deleteAffiliatesUseCase = new DeleteAffiliatesUseCase(
  deleteAffiliatesImplementation
);

export const deleteAffiliatesController = DeleteAffiliatesController(
  deleteAffiliatesUseCase
).execute;

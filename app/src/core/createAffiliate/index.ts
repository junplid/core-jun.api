import { CreateAffiliateImplementation } from "./Implementation";
import { CreateAffiliateController } from "./Controller";
import { CreateAffiliateUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createAffiliateImplementation = new CreateAffiliateImplementation(prisma);
const createAffiliateUseCase = new CreateAffiliateUseCase(
  createAffiliateImplementation
);

export const createAffiliateController = CreateAffiliateController(
  createAffiliateUseCase
).execute;

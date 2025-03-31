import { UpdateAffiliateImplementation } from "./Implementation";
import { UpdateAffiliateController } from "./Controller";
import { UpdateAffiliateUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const updateAffiliateImplementation = new UpdateAffiliateImplementation(prisma);
const updateAffiliateUseCase = new UpdateAffiliateUseCase(
  updateAffiliateImplementation
);

export const updateAffiliateController = UpdateAffiliateController(
  updateAffiliateUseCase
).execute;

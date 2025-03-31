import { CreateInsertLeadOnDemandAudienceImplementation } from "./Implementation";
import { CreateInsertLeadOnDemandAudienceController } from "./Controller";
import { CreateInsertLeadOnDemandAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createInsertLeadOnDemandAudienceImplementation =
  new CreateInsertLeadOnDemandAudienceImplementation(prisma);
const createInsertLeadOnDemandAudienceUseCase =
  new CreateInsertLeadOnDemandAudienceUseCase(
    createInsertLeadOnDemandAudienceImplementation
  );

export const createInsertLeadOnDemandAudienceController =
  CreateInsertLeadOnDemandAudienceController(
    createInsertLeadOnDemandAudienceUseCase
  ).execute;

import { CreateImportCampaignAudienceImplementation } from "./Implementation";
import { CreateImportCampaignAudienceController } from "./Controller";
import { CreateImportCampaignAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createImportCampaignAudienceImplementation =
  new CreateImportCampaignAudienceImplementation(prisma);
const createImportCampaignAudienceUseCase =
  new CreateImportCampaignAudienceUseCase(
    createImportCampaignAudienceImplementation
  );

export const createImportCampaignAudienceController =
  CreateImportCampaignAudienceController(
    createImportCampaignAudienceUseCase
  ).execute;

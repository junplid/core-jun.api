import { CreateStaticCampaignAudienceImplementation } from "./Implementation";
import { CreateStaticCampaignAudienceController } from "./Controller";
import { CreateStaticCampaignAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createStaticCampaignAudienceImplementation =
  new CreateStaticCampaignAudienceImplementation(prisma);
const createStaticCampaignAudienceUseCase =
  new CreateStaticCampaignAudienceUseCase(
    createStaticCampaignAudienceImplementation
  );

export const createStaticCampaignAudienceController =
  CreateStaticCampaignAudienceController(
    createStaticCampaignAudienceUseCase
  ).execute;

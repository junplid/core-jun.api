import { CreateAggregationCampaignAudienceImplementation } from "./Implementation";
import { CreateAggregationCampaignAudienceController } from "./Controller";
import { CreateAggregationCampaignAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createAggregationCampaignAudienceImplementation =
  new CreateAggregationCampaignAudienceImplementation(prisma);
const createAggregationCampaignAudienceUseCase =
  new CreateAggregationCampaignAudienceUseCase(
    createAggregationCampaignAudienceImplementation
  );

export const createAggregationCampaignAudienceController =
  CreateAggregationCampaignAudienceController(
    createAggregationCampaignAudienceUseCase
  ).execute;

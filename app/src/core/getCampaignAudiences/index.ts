import { GetCampaignAudiencesImplementation } from "./Implementation";
import { GetCampaignAudiencesController } from "./Controller";
import { GetCampaignAudiencesUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCampaignAudiencesImplementation =
  new GetCampaignAudiencesImplementation(prisma);
const getCampaignAudiencesUseCase = new GetCampaignAudiencesUseCase(
  getCampaignAudiencesImplementation
);

export const getCampaignAudiencesController = GetCampaignAudiencesController(
  getCampaignAudiencesUseCase
).execute;

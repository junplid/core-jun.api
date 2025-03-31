import { GetCampaignAudienceForSelectImplementation } from "./Implementation";
import { GetCampaignAudienceForSelectController } from "./Controller";
import { GetCampaignAudienceForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCampaignAudienceForSelectImplementation =
  new GetCampaignAudienceForSelectImplementation(prisma);
const getCampaignAudienceForSelectUseCase =
  new GetCampaignAudienceForSelectUseCase(
    getCampaignAudienceForSelectImplementation
  );

export const getCampaignAudienceForSelectController =
  GetCampaignAudienceForSelectController(
    getCampaignAudienceForSelectUseCase
  ).execute;

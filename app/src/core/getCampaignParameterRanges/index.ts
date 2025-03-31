import { GetCampaignParameterRangesImplementation } from "./Implementation";
import { GetCampaignParameterRangesController } from "./Controller";
import { GetCampaignParameterRangesUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCampaignParameterRangesImplementation =
  new GetCampaignParameterRangesImplementation(prisma);
const getCampaignParameterRangesUseCase = new GetCampaignParameterRangesUseCase(
  getCampaignParameterRangesImplementation
);

export const getCampaignParameterRangesController =
  GetCampaignParameterRangesController(
    getCampaignParameterRangesUseCase
  ).execute;

import { GetRootCampaignParameterRangesConfigImplementation } from "./Implementation";
import { GetRootCampaignParameterRangesConfigController } from "./Controller";
import { GetRootCampaignParameterRangesConfigUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getRootCampaignParameterRangesConfigImplementation =
  new GetRootCampaignParameterRangesConfigImplementation(prisma);
const getRootCampaignParameterRangesConfigUseCase =
  new GetRootCampaignParameterRangesConfigUseCase(
    getRootCampaignParameterRangesConfigImplementation
  );

export const getRootCampaignParameterRangesConfigController =
  GetRootCampaignParameterRangesConfigController(
    getRootCampaignParameterRangesConfigUseCase
  ).execute;

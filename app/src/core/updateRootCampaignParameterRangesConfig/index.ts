import { prisma } from "../../adapters/Prisma/client";
import { UpdateRootCampaignParameterRangesConfigController } from "./Controller";
import { UpdateRootCampaignParameterRangesConfigImplementation } from "./Implementation";
import { UpdateRootCampaignParameterRangesConfigUseCase } from "./UseCase";

const updateRootCampaignParameterRangesConfigImplementation =
  new UpdateRootCampaignParameterRangesConfigImplementation(prisma);
const updateRootCampaignParameterRangesConfigUseCase =
  new UpdateRootCampaignParameterRangesConfigUseCase(
    updateRootCampaignParameterRangesConfigImplementation
  );

export const updateRootCampaignParameterRangesConfigController =
  UpdateRootCampaignParameterRangesConfigController(
    updateRootCampaignParameterRangesConfigUseCase
  ).execute;

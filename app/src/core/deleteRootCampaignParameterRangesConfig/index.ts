import { DeleteRootCampaignParameterRangesConfigImplementation } from "./Implementation";
import { DeleteRootCampaignParameterRangesConfigController } from "./Controller";
import { DeleteRootCampaignParameterRangesConfigUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteRootCampaignParameterRangesConfigImplementation =
  new DeleteRootCampaignParameterRangesConfigImplementation(prisma);
const deleteRootCampaignParameterRangesConfigUseCase =
  new DeleteRootCampaignParameterRangesConfigUseCase(
    deleteRootCampaignParameterRangesConfigImplementation
  );

export const deleteRootCampaignParameterRangesConfigController =
  DeleteRootCampaignParameterRangesConfigController(
    deleteRootCampaignParameterRangesConfigUseCase
  ).execute;

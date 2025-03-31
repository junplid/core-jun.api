import { CreateRootCampaignParameterRangesConfigImplementation } from "./Implementation";
import { CreateRootCampaignParameterRangesConfigController } from "./Controller";
import { CreateRootCampaignParameterRangesConfigUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createRootCampaignParameterRangesConfigImplementation =
  new CreateRootCampaignParameterRangesConfigImplementation(prisma);
const createRootCampaignParameterRangesConfigUseCase =
  new CreateRootCampaignParameterRangesConfigUseCase(
    createRootCampaignParameterRangesConfigImplementation
  );

export const createRootCampaignParameterRangesConfigController =
  CreateRootCampaignParameterRangesConfigController(
    createRootCampaignParameterRangesConfigUseCase
  ).execute;

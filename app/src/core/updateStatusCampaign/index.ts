import { prisma } from "../../adapters/Prisma/client";
import { UpdateStatusCampaignController } from "./Controller";
import { UpdateStatusCampaignImplementation } from "./Implementation";
import { UpdateStatusCampaignUseCase } from "./UseCase";

const updateStatusCampaignImplementation =
  new UpdateStatusCampaignImplementation(prisma);
const updateStatusCampaignUseCase = new UpdateStatusCampaignUseCase(
  updateStatusCampaignImplementation
);

export const updateStatusCampaignController =
  UpdateStatusCampaignController(updateStatusCampaignUseCase).execute;

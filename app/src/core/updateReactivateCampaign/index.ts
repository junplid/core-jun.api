import { prisma } from "../../adapters/Prisma/client";
import { UpdateReactivateCampaignController } from "./Controller";
import { UpdateReactivateCampaignImplementation } from "./Implementation";
import { UpdateReactivateCampaignUseCase } from "./UseCase";

const updateReactivateCampaignImplementation =
  new UpdateReactivateCampaignImplementation(prisma);
const updateReactivateCampaignUseCase = new UpdateReactivateCampaignUseCase(
  updateReactivateCampaignImplementation
);

export const updateReactivateCampaignController =
  UpdateReactivateCampaignController(updateReactivateCampaignUseCase).execute;

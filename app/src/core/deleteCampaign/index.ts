import { DeleteCampaignImplementation } from "./Implementation";
import { DeleteCampaignController } from "./Controller";
import { DeleteCampaignUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteCampaignImplementation = new DeleteCampaignImplementation(prisma);
const deleteCampaignUseCase = new DeleteCampaignUseCase(
  deleteCampaignImplementation
);

export const deleteCampaignController = DeleteCampaignController(
  deleteCampaignUseCase
).execute;

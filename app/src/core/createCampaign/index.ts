import { CraeteCampaignImplementation } from "./Implementation";
import { CreateCampaignController } from "./Controller";
import { CreateCampaignUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createCampaignImplementation = new CraeteCampaignImplementation(prisma);
const createCampaignUseCase = new CreateCampaignUseCase(
  createCampaignImplementation
);

export const createCampaignController = CreateCampaignController(
  createCampaignUseCase
).execute;

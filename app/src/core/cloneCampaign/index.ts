import { CraeteCampaignImplementation } from "./Implementation";
import { CloneCampaignController } from "./Controller";
import { CloneCampaignUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const cloneCampaignImplementation = new CraeteCampaignImplementation(prisma);
const cloneCampaignUseCase = new CloneCampaignUseCase(
  cloneCampaignImplementation
);

export const cloneCampaignController =
  CloneCampaignController(cloneCampaignUseCase).execute;

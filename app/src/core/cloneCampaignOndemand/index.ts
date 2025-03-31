import { CraeteCampaignImplementation } from "./Implementation";
import { CloneCampaignOndemandController } from "./Controller";
import { CloneCampaignOndemandUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const cloneCampaignOndemandImplementation = new CraeteCampaignImplementation(
  prisma
);
const cloneCampaignOndemandUseCase = new CloneCampaignOndemandUseCase(
  cloneCampaignOndemandImplementation
);

export const cloneCampaignOndemandController = CloneCampaignOndemandController(
  cloneCampaignOndemandUseCase
).execute;

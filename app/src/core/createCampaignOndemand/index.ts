import { CraeteCampaignImplementation } from "./Implementation";
import { CreateCampaignOndemandController } from "./Controller";
import { CreateCampaignOndemandUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createCampaignOndemandImplementation = new CraeteCampaignImplementation(
  prisma
);
const createCampaignOndemandUseCase = new CreateCampaignOndemandUseCase(
  createCampaignOndemandImplementation
);

export const createCampaignOndemandController =
  CreateCampaignOndemandController(createCampaignOndemandUseCase).execute;

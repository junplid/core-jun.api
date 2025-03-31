import { GetCampaignOnAccountForSelectImplementation } from "./Implementation";
import { GetCampaignOnAccountForSelectController } from "./Controller";
import { GetCampaignOnAccountForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCampaignOnAccountForSelectImplementation =
  new GetCampaignOnAccountForSelectImplementation(prisma);
const getCampaignOnAccountForSelectUseCase =
  new GetCampaignOnAccountForSelectUseCase(
    getCampaignOnAccountForSelectImplementation
  );

export const getCampaignOnAccountForSelectController =
  GetCampaignOnAccountForSelectController(
    getCampaignOnAccountForSelectUseCase
  ).execute;

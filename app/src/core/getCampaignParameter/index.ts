import { GetCampaignParameterImplementation } from "./Implementation";
import { GetCampaignParameterController } from "./Controller";
import { GetCampaignParameterUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCampaignParameterImplementation =
  new GetCampaignParameterImplementation(prisma);
const getCampaignParameterUseCase = new GetCampaignParameterUseCase(
  getCampaignParameterImplementation
);

export const getCampaignParameterController = GetCampaignParameterController(
  getCampaignParameterUseCase
).execute;

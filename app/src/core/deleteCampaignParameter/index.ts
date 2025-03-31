import { CraeteCompanyImplementation } from "./Implementation";
import { DeleteCampaignParameterController } from "./Controller";
import { DeleteCampaignParameterUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteCampaignParameterImplementation = new CraeteCompanyImplementation(
  prisma
);
const deleteCampaignParameterUseCase = new DeleteCampaignParameterUseCase(
  deleteCampaignParameterImplementation
);

export const deleteCampaignParameterController =
  DeleteCampaignParameterController(deleteCampaignParameterUseCase).execute;

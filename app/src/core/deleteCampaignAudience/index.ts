import { CraeteCompanyImplementation } from "./Implementation";
import { DeleteCampaignAudienceController } from "./Controller";
import { DeleteCampaignAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteCampaignAudienceImplementation = new CraeteCompanyImplementation(
  prisma
);
const deleteCampaignAudienceUseCase = new DeleteCampaignAudienceUseCase(
  deleteCampaignAudienceImplementation
);

export const deleteCampaignAudienceController =
  DeleteCampaignAudienceController(deleteCampaignAudienceUseCase).execute;

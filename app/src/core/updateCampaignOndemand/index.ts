import { UpdateCampaignOndemandController } from "./Controller";
import { UpdateCampaignOndemandUseCase } from "./UseCase";

export const updateCampaignOndemandController =
  UpdateCampaignOndemandController(new UpdateCampaignOndemandUseCase()).execute;

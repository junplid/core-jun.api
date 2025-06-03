import { DeleteCampaignController } from "./Controller";
import { DeleteCampaignUseCase } from "./UseCase";

export const deleteCampaignController = DeleteCampaignController(
  new DeleteCampaignUseCase()
).execute;

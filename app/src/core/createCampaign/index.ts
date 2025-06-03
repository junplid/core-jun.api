import { CreateCampaignController } from "./Controller";
import { CreateCampaignUseCase } from "./UseCase";

export const createCampaignController = CreateCampaignController(
  new CreateCampaignUseCase()
).execute;

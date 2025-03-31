import { GetCampaignParameterDetailsController } from "./Controller";
import { GetCampaignParameterDetailsUseCase } from "./UseCase";

export const getCampaignParameterDetailsController =
  GetCampaignParameterDetailsController(
    new GetCampaignParameterDetailsUseCase()
  ).execute;

import { GetCampaignParameterIdController } from "./Controller";
import { GetCampaignParameterIdUseCase } from "./UseCase";

export const getCampaignParameterIdController =
  GetCampaignParameterIdController(new GetCampaignParameterIdUseCase()).execute;

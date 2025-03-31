import { CloneCampaignParameterController } from "./Controller";
import { CloneCampaignParameterUseCase } from "./UseCase";

export const cloneCampaignParameterController =
  CloneCampaignParameterController(new CloneCampaignParameterUseCase()).execute;

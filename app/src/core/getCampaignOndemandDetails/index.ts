import { GetCampaignOndemandDetailsController } from "./Controller";
import { GetCampaignOndemandDetailsUseCase } from "./UseCase";

export const getCampaignOndemandDetailsController =
  GetCampaignOndemandDetailsController(
    new GetCampaignOndemandDetailsUseCase()
  ).execute;

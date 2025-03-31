import { GetBusinessFacebookIntegrationForSelectController } from "./Controller";
import { GetBusinessFacebookIntegrationForSelectUseCase } from "./UseCase";

export const getBusinessFacebookIntegrationForSelectController =
  GetBusinessFacebookIntegrationForSelectController(
    new GetBusinessFacebookIntegrationForSelectUseCase()
  ).execute;

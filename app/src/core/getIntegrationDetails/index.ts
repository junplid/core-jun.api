import { GetIntegrationDetailsController } from "./Controller";
import { GetIntegrationDetailsUseCase } from "./UseCase";

export const getIntegrationDetailsController = GetIntegrationDetailsController(
  new GetIntegrationDetailsUseCase()
).execute;

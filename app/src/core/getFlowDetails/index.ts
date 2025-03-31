import { GetFlowDetailsController } from "./Controller";
import { GetFlowDetailsUseCase } from "./UseCase";

export const getFlowDetailsController = GetFlowDetailsController(
  new GetFlowDetailsUseCase()
).execute;

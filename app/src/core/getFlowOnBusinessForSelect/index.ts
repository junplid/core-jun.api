import { GetFlowOnBusinessForSelectController } from "./Controller";
import { GetFlowOnBusinessForSelectUseCase } from "./UseCase";

export const getFlowOnBusinessForSelectController =
  GetFlowOnBusinessForSelectController(
    new GetFlowOnBusinessForSelectUseCase()
  ).execute;

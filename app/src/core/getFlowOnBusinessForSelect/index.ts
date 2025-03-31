import { GetFlowOnBusinessForSelectImplementation } from "./Implementation";
import { GetFlowOnBusinessForSelectController } from "./Controller";
import { GetFlowOnBusinessForSelectUseCase } from "./UseCase";

const getFlowOnBusinessForSelectImplementation =
  new GetFlowOnBusinessForSelectImplementation();
const getFlowOnBusinessForSelectUseCase = new GetFlowOnBusinessForSelectUseCase(
  getFlowOnBusinessForSelectImplementation
);

export const getFlowOnBusinessForSelectController =
  GetFlowOnBusinessForSelectController(
    getFlowOnBusinessForSelectUseCase
  ).execute;

import { GetDataFlowIdController } from "./Controller";
import { GetDataFlowIdUseCase } from "./UseCase";

export const getDataFlowIdController = GetDataFlowIdController(
  new GetDataFlowIdUseCase()
).execute;

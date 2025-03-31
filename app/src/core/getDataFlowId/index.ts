import { CraeteFlowImplementation } from "./Implementation";
import { GetDataFlowIdController } from "./Controller";
import { GetDataFlowIdUseCase } from "./UseCase";

const getDataFlowIdImplementation = new CraeteFlowImplementation();
const getDataFlowIdUseCase = new GetDataFlowIdUseCase(
  getDataFlowIdImplementation
);

export const getDataFlowIdController =
  GetDataFlowIdController(getDataFlowIdUseCase).execute;

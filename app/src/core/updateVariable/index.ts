import { UpdateVariableBusinessController } from "./Controller";
import { UpdateVariableBusinessUseCase } from "./UseCase";

export const updateVariableBusinessController =
  UpdateVariableBusinessController(new UpdateVariableBusinessUseCase()).execute;

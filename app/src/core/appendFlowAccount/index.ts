import { AppendFlowAccountController } from "./Controller";
import { AppendFlowAccountUseCase } from "./UseCase";

export const appendFlowAccountController = AppendFlowAccountController(
  new AppendFlowAccountUseCase()
).execute;

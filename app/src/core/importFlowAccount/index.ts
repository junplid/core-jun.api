import { ImportFlowAccountController } from "./Controller";
import { ImportFlowAccountUseCase } from "./UseCase";

export const importFlowAccountController = ImportFlowAccountController(
  new ImportFlowAccountUseCase(),
).execute;

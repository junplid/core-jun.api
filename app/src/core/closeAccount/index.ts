import { CloseAccountController } from "./Controller";
import { CloseAccountUseCase } from "./UseCase";

export const closeAccountController = CloseAccountController(
  new CloseAccountUseCase(),
).execute;

import { UpdateAccountController } from "./Controller";
import { UpdateAccountUseCase } from "./UseCase";

export const updateAccountController = UpdateAccountController(
  new UpdateAccountUseCase()
).execute;

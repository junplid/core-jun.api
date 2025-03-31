import { CreateAccountController } from "./Controller";
import { CreateAccountUseCase } from "./UseCase";

export const createAccountController = CreateAccountController(
  new CreateAccountUseCase()
).execute;

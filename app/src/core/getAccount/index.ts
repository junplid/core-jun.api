import { GetAccountController } from "./Controller";
import { GetAccountUseCase } from "./UseCase";

export const getAccountController = GetAccountController(
  new GetAccountUseCase()
).execute;

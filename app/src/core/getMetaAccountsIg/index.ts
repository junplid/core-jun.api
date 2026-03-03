import { GetAccountsIgController } from "./Controller";
import { GetAccountsIgUseCase } from "./UseCase";

export const getAccountsIgController = GetAccountsIgController(
  new GetAccountsIgUseCase(),
).execute;

import { GetAccountUserController } from "./Controller";
import { GetAccountUserUseCase } from "./UseCase";

export const getAccountUserController = GetAccountUserController(
  new GetAccountUserUseCase()
).execute;

import { GetMyAccountController } from "./Controller";
import { GetMyAccountUseCase } from "./UseCase";

export const getMyAccountController = GetMyAccountController(
  new GetMyAccountUseCase()
).execute;

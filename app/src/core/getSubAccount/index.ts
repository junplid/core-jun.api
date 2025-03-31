import { GetSubAccountController } from "./Controller";
import { GetSubAccountUseCase } from "./UseCase";

export const getSubAccountController = GetSubAccountController(
  new GetSubAccountUseCase()
).execute;

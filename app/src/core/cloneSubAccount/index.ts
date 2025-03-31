import { CloneSubAccountController } from "./Controller";
import { CloneSubAccountUseCase } from "./UseCase";

export const cloneSubAccountController = CloneSubAccountController(
  new CloneSubAccountUseCase()
).execute;

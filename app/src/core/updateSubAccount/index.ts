import { UpdateSubAccountController } from "./Controller";
import { UpdateSubAccountUseCase } from "./UseCase";

export const updateSubAccountController = UpdateSubAccountController(
  new UpdateSubAccountUseCase()
).execute;

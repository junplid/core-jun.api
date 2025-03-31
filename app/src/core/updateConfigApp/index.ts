import { UpdateConfigAppController } from "./Controller";
import { UpdateConfigAppUseCase } from "./UseCase";

export const updateConfigAppController = UpdateConfigAppController(
  new UpdateConfigAppUseCase()
).execute;

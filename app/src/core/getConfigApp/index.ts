import { GetConfigAppController } from "./Controller";
import { GetConfigAppUseCase } from "./UseCase";

export const getConfigAppController = GetConfigAppController(
  new GetConfigAppUseCase()
).execute;

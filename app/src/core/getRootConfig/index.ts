import { GetRootConfigController } from "./Controller";
import { GetRootConfigUseCase } from "./UseCase";

export const getRootConfigController = GetRootConfigController(
  new GetRootConfigUseCase()
).execute;

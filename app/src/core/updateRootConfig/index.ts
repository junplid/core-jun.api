import { UpdateRootConfigController } from "./Controller";
import { UpdateRootConfigUseCase } from "./UseCase";

export const updateRootConfigController = UpdateRootConfigController(
  new UpdateRootConfigUseCase()
).execute;

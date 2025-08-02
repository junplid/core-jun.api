import { UpdateMenuOnlineController } from "./Controller";
import { UpdateMenuOnlineUseCase } from "./UseCase";

export const updateMenuOnlineController = UpdateMenuOnlineController(
  new UpdateMenuOnlineUseCase()
).execute;

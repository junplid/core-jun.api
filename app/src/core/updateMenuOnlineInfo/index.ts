import { UpdateMenuOnlineInfoController } from "./Controller";
import { UpdateMenuOnlineInfoUseCase } from "./UseCase";

export const updateMenuOnlineInfoController = UpdateMenuOnlineInfoController(
  new UpdateMenuOnlineInfoUseCase(),
).execute;

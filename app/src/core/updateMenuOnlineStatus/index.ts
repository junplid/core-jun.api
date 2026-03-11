import { UpdateMenuOnlineStatusController } from "./Controller";
import { UpdateMenuOnlineStatusUseCase } from "./UseCase";

export const updateMenuOnlineStatusController =
  UpdateMenuOnlineStatusController(new UpdateMenuOnlineStatusUseCase()).execute;

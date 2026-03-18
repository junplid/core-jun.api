import { UpdateMenuOnlineSubItemsStatusController } from "./Controller";
import { UpdateMenuOnlineSubItemsStatusUseCase } from "./UseCase";

export const updateMenuOnlineSubItemsStatusController =
  UpdateMenuOnlineSubItemsStatusController(
    new UpdateMenuOnlineSubItemsStatusUseCase(),
  ).execute;

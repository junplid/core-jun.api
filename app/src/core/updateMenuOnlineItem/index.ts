import { UpdateMenuOnlineItemController } from "./Controller";
import { UpdateMenuOnlineItemUseCase } from "./UseCase";

export const updateMenuOnlineItemController = UpdateMenuOnlineItemController(
  new UpdateMenuOnlineItemUseCase(),
).execute;

import { DeleteMenuOnlineItemController } from "./Controller";
import { DeleteMenuOnlineItemUseCase } from "./UseCase";

export const deleteMenuOnlineItemController = DeleteMenuOnlineItemController(
  new DeleteMenuOnlineItemUseCase()
).execute;

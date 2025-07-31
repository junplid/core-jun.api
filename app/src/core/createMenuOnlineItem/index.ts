import { CreateMenuOnlineItemController } from "./Controller";
import { CreateMenuOnlineItemUseCase } from "./UseCase";

export const createMenuOnlineItemController = CreateMenuOnlineItemController(
  new CreateMenuOnlineItemUseCase()
).execute;

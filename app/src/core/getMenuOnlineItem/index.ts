import { GetMenuOnlineItemController } from "./Controller";
import { GetMenuOnlineItemUseCase } from "./UseCase";

export const getMenuOnlineItemController = GetMenuOnlineItemController(
  new GetMenuOnlineItemUseCase(),
).execute;

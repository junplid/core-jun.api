import { GetMenuOnlineItemsController } from "./Controller";
import { GetMenuOnlineItemsUseCase } from "./UseCase";

export const getMenuOnlineItemsController = GetMenuOnlineItemsController(
  new GetMenuOnlineItemsUseCase()
).execute;

import { GetMenuOnlineItemsForSelectController } from "./Controller";
import { GetMenuOnlineItemsForSelectUseCase } from "./UseCase";

export const getMenuOnlineItemsForSelectController =
  GetMenuOnlineItemsForSelectController(
    new GetMenuOnlineItemsForSelectUseCase(),
  ).execute;

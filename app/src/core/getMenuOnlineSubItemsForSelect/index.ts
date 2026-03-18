import { GetMenuOnlineSubItemsForSelectController } from "./Controller";
import { GetMenuOnlineSubItemsForSelectUseCase } from "./UseCase";

export const getMenuOnlineSubItemsForSelectController =
  GetMenuOnlineSubItemsForSelectController(
    new GetMenuOnlineSubItemsForSelectUseCase(),
  ).execute;

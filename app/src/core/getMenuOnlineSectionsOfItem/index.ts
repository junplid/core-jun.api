import { GetMenuOnlineSectionsOfItemController } from "./Controller";
import { GetMenuOnlineSectionsOfItemUseCase } from "./UseCase";

export const getMenuOnlineSectionsOfItemController =
  GetMenuOnlineSectionsOfItemController(
    new GetMenuOnlineSectionsOfItemUseCase(),
  ).execute;

import { GetMenuOnlineCategoriesForSelectController } from "./Controller";
import { GetMenuOnlineCategoriesForSelectUseCase } from "./UseCase";

export const getMenuOnlineCategoriesForSelectController =
  GetMenuOnlineCategoriesForSelectController(
    new GetMenuOnlineCategoriesForSelectUseCase(),
  ).execute;

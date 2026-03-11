import { GetMenuOnlineCategoriesController } from "./Controller";
import { GetMenuOnlineCategoriesUseCase } from "./UseCase";

export const getMenuOnlineCategoryController =
  GetMenuOnlineCategoriesController(
    new GetMenuOnlineCategoriesUseCase(),
  ).execute;

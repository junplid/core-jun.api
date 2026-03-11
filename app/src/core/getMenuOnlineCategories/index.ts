import { GetMenuOnlineCategoriesController } from "./Controller";
import { GetMenuOnlineCategoriesUseCase } from "./UseCase";

export const getMenuOnlineCategoriesController =
  GetMenuOnlineCategoriesController(
    new GetMenuOnlineCategoriesUseCase(),
  ).execute;

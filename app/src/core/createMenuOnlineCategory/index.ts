import { CreateMenuOnlineCategoryController } from "./Controller";
import { CreateMenuOnlineCategoryUseCase } from "./UseCase";

export const createMenuOnlineCategoryController =
  CreateMenuOnlineCategoryController(
    new CreateMenuOnlineCategoryUseCase(),
  ).execute;

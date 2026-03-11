import { UpdateMenuOnlineCategoryController } from "./Controller";
import { UpdateMenuOnlineCategoryUseCase } from "./UseCase";

export const updateMenuOnlineCategoryController =
  UpdateMenuOnlineCategoryController(
    new UpdateMenuOnlineCategoryUseCase(),
  ).execute;

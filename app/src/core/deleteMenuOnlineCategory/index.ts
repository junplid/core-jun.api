import { DeleteMenuOnlineCategoryController } from "./Controller";
import { DeleteMenuOnlineCategoryUseCase } from "./UseCase";

export const deleteMenuOnlineCategoryController =
  DeleteMenuOnlineCategoryController(
    new DeleteMenuOnlineCategoryUseCase(),
  ).execute;

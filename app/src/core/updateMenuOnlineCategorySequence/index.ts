import { UpdateMenuOnlineCategorySequenceController } from "./Controller";
import { UpdateMenuOnlineCategorySequenceUseCase } from "./UseCase";

export const updateMenuOnlineCategorySequenceController =
  UpdateMenuOnlineCategorySequenceController(
    new UpdateMenuOnlineCategorySequenceUseCase(),
  ).execute;

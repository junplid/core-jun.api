import { UpdateTableController } from "./Controller";
import { UpdateTableUseCase } from "./UseCase";

export const updateTableController = UpdateTableController(
  new UpdateTableUseCase(),
).execute;

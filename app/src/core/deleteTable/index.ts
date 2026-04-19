import { DeleteTableController } from "./Controller";
import { DeleteTableUseCase } from "./UseCase";

export const deleteTableController = DeleteTableController(
  new DeleteTableUseCase(),
).execute;

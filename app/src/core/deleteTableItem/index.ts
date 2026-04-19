import { DeleteTableItemController } from "./Controller";
import { DeleteTableItemUseCase } from "./UseCase";

export const deleteTableItemController = DeleteTableItemController(
  new DeleteTableItemUseCase(),
).execute;

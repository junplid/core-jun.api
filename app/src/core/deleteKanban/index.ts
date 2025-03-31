import { DeleteKanbanController } from "./Controller";
import { DeleteKanbanUseCase } from "./UseCase";

export const deleteKanbanController = DeleteKanbanController(
  new DeleteKanbanUseCase()
).execute;

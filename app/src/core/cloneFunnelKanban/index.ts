import { CreateCloneFunnelKanbanWaController } from "./Controller";
import { CreateCloneFunnelKanbanWaUseCase } from "./UseCase";

export const createCloneFunnelKanbanWaController =
  CreateCloneFunnelKanbanWaController(
    new CreateCloneFunnelKanbanWaUseCase()
  ).execute;

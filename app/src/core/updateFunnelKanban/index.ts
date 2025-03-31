import { UpdateFunnelKanbanADMController } from "./Controller";
import { UpdateFunnelKanbanADMUseCase } from "./UseCase";

export const updateFunnelKanbanADMController = UpdateFunnelKanbanADMController(
  new UpdateFunnelKanbanADMUseCase()
).execute;

import { GetFunnelKanbanADMController } from "./Controller";
import { GetFunnelKanbanADMUseCase } from "./UseCase";

export const getFunnelKanbanADMController = GetFunnelKanbanADMController(
  new GetFunnelKanbanADMUseCase()
).execute;

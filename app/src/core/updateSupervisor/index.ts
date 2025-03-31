import { UpdateSupervisorController } from "./Controller";
import { UpdateSupervisorUseCase } from "./UseCase";

export const updateSupervisorController = UpdateSupervisorController(
  new UpdateSupervisorUseCase()
).execute;

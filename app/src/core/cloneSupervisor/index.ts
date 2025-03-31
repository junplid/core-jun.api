import { CloneSupervisorController } from "./Controller";
import { CloneSupervisorUseCase } from "./UseCase";

export const cloneSupervisorController = CloneSupervisorController(
  new CloneSupervisorUseCase()
).execute;

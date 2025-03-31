import { GetSupervisorController } from "./Controller";
import { GetSupervisorUseCase } from "./UseCase";

export const getSupervisorController = GetSupervisorController(
  new GetSupervisorUseCase()
).execute;

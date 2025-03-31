import { GetSupervisorDetailsController } from "./Controller";
import { GetSupervisorDetailsUseCase } from "./UseCase";

export const getSupervisorDetailsController = GetSupervisorDetailsController(
  new GetSupervisorDetailsUseCase()
).execute;

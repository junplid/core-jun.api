import { UpdatePlanController } from "./Controller";
import { UpdatePlanUseCase } from "./UseCase";

export const updatePlanController = UpdatePlanController(
  new UpdatePlanUseCase()
).execute;

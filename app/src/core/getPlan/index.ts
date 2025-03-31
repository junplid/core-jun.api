import { GetPlanController } from "./Controller";
import { GetPlanUseCase } from "./UseCase";

export const getPlanController = GetPlanController(
  new GetPlanUseCase()
).execute;

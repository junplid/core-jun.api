import { CreatePlanController } from "./Controller";
import { CreatePlanUseCase } from "./UseCase";

export const createPlanController = CreatePlanController(
  new CreatePlanUseCase()
).execute;

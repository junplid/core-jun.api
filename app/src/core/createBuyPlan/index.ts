import { CreateBuyPlanController } from "./Controller";
import { CreateBuyPlanUseCase } from "./UseCase";

export const createBuyPlanController = CreateBuyPlanController(
  new CreateBuyPlanUseCase()
).execute;

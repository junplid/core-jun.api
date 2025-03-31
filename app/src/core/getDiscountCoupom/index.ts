import { GetDiscountCoupomController } from "./Controller";
import { GetDiscountCoupomUseCase } from "./UseCase";

export const getDiscountCoupomController = GetDiscountCoupomController(
  new GetDiscountCoupomUseCase()
).execute;

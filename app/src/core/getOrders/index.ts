import { GetOrdersController } from "./Controller";
import { GetOrdersUseCase } from "./UseCase";

export const getOrdersController = GetOrdersController(
  new GetOrdersUseCase()
).execute;

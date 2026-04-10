import { GetRouterOrdersController } from "./Controller";
import { GetRouterOrdersUseCase } from "./UseCase";

export const getRouterOrdersController = GetRouterOrdersController(
  new GetRouterOrdersUseCase(),
).execute;

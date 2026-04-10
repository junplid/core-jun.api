import { CollectRouteOrderController } from "./Controller";
import { CollectRouteOrderUseCase } from "./UseCase";

export const collectRouteOrderController = CollectRouteOrderController(
  new CollectRouteOrderUseCase(),
).execute;

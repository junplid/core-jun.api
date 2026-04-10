import { DeliveryCodeRouteOrderController } from "./Controller";
import { DeliveryCodeRouteOrderUseCase } from "./UseCase";

export const deliveryCodeRouteOrderController =
  DeliveryCodeRouteOrderController(new DeliveryCodeRouteOrderUseCase()).execute;

import { CreateMenuOnlineOrderController } from "./Controller";
import { CreateMenuOnlineOrderUseCase } from "./UseCase";

export const createMenuOnlineOrderController = CreateMenuOnlineOrderController(
  new CreateMenuOnlineOrderUseCase()
).execute;

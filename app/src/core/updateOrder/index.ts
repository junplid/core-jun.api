import { UpdateOrderController } from "./Controller";
import { UpdateOrderUseCase } from "./UseCase";

export const updateOrderController = UpdateOrderController(
  new UpdateOrderUseCase()
).execute;

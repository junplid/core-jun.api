import { PrintTableOrderController } from "./Controller";
import { PrintTableOrderUseCase } from "./UseCase";

export const printTableOrderController = PrintTableOrderController(
  new PrintTableOrderUseCase(),
).execute;

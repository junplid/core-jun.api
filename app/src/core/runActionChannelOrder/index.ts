import { RunActionChannelOrderController } from "./Controller";
import { RunActionChannelOrderUseCase } from "./UseCase";

export const runActionChannelOrderController = RunActionChannelOrderController(
  new RunActionChannelOrderUseCase()
).execute;

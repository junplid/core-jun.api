import { PickTicketController } from "./Controller";
import { PickTicketUseCase } from "./UseCase";

export const pickTicketController = PickTicketController(
  new PickTicketUseCase()
).execute;

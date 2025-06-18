import { ReturnTicketController } from "./Controller";
import { ReturnTicketUseCase } from "./UseCase";

export const returnTicketController = ReturnTicketController(
  new ReturnTicketUseCase()
).execute;

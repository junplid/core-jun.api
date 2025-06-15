import { GetTicketController } from "./Controller";
import { GetTicketUseCase } from "./UseCase";

export const getTicketController = GetTicketController(
  new GetTicketUseCase()
).execute;

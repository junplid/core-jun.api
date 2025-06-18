import { ResolveTicketController } from "./Controller";
import { ResolveTicketUseCase } from "./UseCase";

export const resolveTicketController = ResolveTicketController(
  new ResolveTicketUseCase()
).execute;

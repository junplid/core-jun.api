import { CreateNewTicketController } from "./Controller";
import { CreateNewTicketUseCase } from "./UseCase";

const createNewTicketUseCase = new CreateNewTicketUseCase();

export const createNewTicketController = CreateNewTicketController(
  createNewTicketUseCase
).execute;

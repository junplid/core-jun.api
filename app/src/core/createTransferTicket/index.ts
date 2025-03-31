import { CreateTransferTicketController } from "./Controller";
import { CreateTransferTicketUseCase } from "./UseCase";

const createTransferTicketUseCase = new CreateTransferTicketUseCase();

export const createTransferTicketController = CreateTransferTicketController(
  createTransferTicketUseCase
).execute;

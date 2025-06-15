import { SendTicketMessageController } from "./Controller";
import { SendTicketMessageUseCase } from "./UseCase";

export const sendTicketMessageController = SendTicketMessageController(
  new SendTicketMessageUseCase()
).execute;

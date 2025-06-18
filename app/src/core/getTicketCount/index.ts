import { GetTicketCountController } from "./Controller";
import { GetTicketCountUseCase } from "./UseCase";

export const getTicketCountController = GetTicketCountController(
  new GetTicketCountUseCase()
).execute;

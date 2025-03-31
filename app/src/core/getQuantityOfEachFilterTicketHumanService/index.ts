import { GetQuantityOfEachFilterTicketHumanServiceController } from "./Controller";
import { GetQuantityOfEachFilterTicketHumanServiceUseCase } from "./UseCase";

export const getQuantityOfEachFilterTicketHumanServiceController =
  GetQuantityOfEachFilterTicketHumanServiceController(
    new GetQuantityOfEachFilterTicketHumanServiceUseCase()
  ).execute;

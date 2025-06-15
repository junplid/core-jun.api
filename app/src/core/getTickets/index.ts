import { GetTicketsController } from "./Controller";
import { GetTicketsUseCase } from "./UseCase";

export const getTicketsController = GetTicketsController(
  new GetTicketsUseCase()
).execute;

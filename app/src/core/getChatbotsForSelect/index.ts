import { GetChabotsForSelectController } from "./Controller";
import { GetChabotsForSelectUseCase } from "./UseCase";

export const getChabotsForSelectController = GetChabotsForSelectController(
  new GetChabotsForSelectUseCase()
).execute;

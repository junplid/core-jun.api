import { GetChabotsController } from "./Controller";
import { GetChabotsUseCase } from "./UseCase";

export const getChabotsController = GetChabotsController(
  new GetChabotsUseCase()
).execute;

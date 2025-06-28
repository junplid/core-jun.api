import { GetChargesController } from "./Controller";
import { GetChargesUseCase } from "./UseCase";

export const getChargesController = GetChargesController(
  new GetChargesUseCase()
).execute;

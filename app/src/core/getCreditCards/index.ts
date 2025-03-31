import { GetCreditCardController } from "./Controller";
import { GetCreditCardUseCase } from "./UseCase";

export const getCreditCardController = GetCreditCardController(
  new GetCreditCardUseCase()
).execute;

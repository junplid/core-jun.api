import { CreateCreditCardController } from "./Controller";
import { CreateCreditCardUseCase } from "./UseCase";

export const createCreditCardController = CreateCreditCardController(
  new CreateCreditCardUseCase()
).execute;

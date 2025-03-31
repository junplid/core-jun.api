import { DeleteCreditCardController } from "./Controller";
import { DeleteCreditCardUseCase } from "./UseCase";

export const deleteCreditCardController = DeleteCreditCardController(
  new DeleteCreditCardUseCase()
).execute;

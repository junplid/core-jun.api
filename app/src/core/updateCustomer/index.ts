import { UpdateCustomerController } from "./Controller";
import { UpdateCustomerUseCase } from "./UseCase";

export const updateCustomerController = UpdateCustomerController(
  new UpdateCustomerUseCase()
).execute;

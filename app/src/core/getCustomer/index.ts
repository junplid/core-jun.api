import { GetCustomerController } from "./Controller";
import { GetCustomerUseCase } from "./UseCase";

export const getCustomerController = GetCustomerController(
  new GetCustomerUseCase()
).execute;

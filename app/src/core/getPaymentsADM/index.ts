import { GetPaymentsADMController } from "./Controller";
import { GetPaymentsADMUseCase } from "./UseCase";

export const getPaymentsADMController = GetPaymentsADMController(
  new GetPaymentsADMUseCase()
).execute;

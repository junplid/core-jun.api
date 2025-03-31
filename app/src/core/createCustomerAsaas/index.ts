import { CreateCustomerAsaasController } from "./Controller";
import { CreateCustomerAsaasUseCase } from "./UseCase";

export const createCustomerAsaasController = CreateCustomerAsaasController(
  new CreateCustomerAsaasUseCase()
).execute;

import { GetBusinessIdOnAccountController } from "./Controller";
import { GetBusinessIdOnAccountUseCase } from "./UseCase";

export const getBusinessIdOnAccountController =
  GetBusinessIdOnAccountController(new GetBusinessIdOnAccountUseCase()).execute;

import { GetContactWAOnAccountController } from "./Controller";
import { GetContactWAOnAccountUseCase } from "./UseCase";

export const getContactWAOnAccountController = GetContactWAOnAccountController(
  new GetContactWAOnAccountUseCase()
).execute;

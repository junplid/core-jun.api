import { GetInboxUserForSelectController } from "./Controller";
import { GetInboxUserForSelectUseCase } from "./UseCase";

export const getInboxUserForSelectController = GetInboxUserForSelectController(
  new GetInboxUserForSelectUseCase()
).execute;

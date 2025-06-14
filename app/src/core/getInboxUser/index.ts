import { GetInboxUserController } from "./Controller";
import { GetInboxUserUseCase } from "./UseCase";

export const getInboxUserController = GetInboxUserController(
  new GetInboxUserUseCase()
).execute;

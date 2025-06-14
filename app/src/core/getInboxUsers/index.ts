import { GetInboxUsersController } from "./Controller";
import { GetInboxUsersUseCase } from "./UseCase";

export const getInboxUsersController = GetInboxUsersController(
  new GetInboxUsersUseCase()
).execute;

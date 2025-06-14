import { CreateInboxUsersController } from "./Controller";
import { CreateInboxUsersUseCase } from "./UseCase";

export const createInboxUsersController = CreateInboxUsersController(
  new CreateInboxUsersUseCase()
).execute;

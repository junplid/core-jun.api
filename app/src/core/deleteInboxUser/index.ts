import { DeleteInboxUsersController } from "./Controller";
import { DeleteInboxUsersUseCase } from "./UseCase";

export const deleteInboxUsersController = DeleteInboxUsersController(
  new DeleteInboxUsersUseCase()
).execute;

import { UpdateInboxUserController } from "./Controller";
import { UpdateInboxUserUseCase } from "./UseCase";

export const updateInboxUserController = UpdateInboxUserController(
  new UpdateInboxUserUseCase()
).execute;

import { UpdateBusinessOnAccountController } from "./Controller";
import { UpdateBusinessOnAccountUseCase } from "./UseCase";

export const updateBusinessOnAccountController =
  UpdateBusinessOnAccountController(
    new UpdateBusinessOnAccountUseCase()
  ).execute;

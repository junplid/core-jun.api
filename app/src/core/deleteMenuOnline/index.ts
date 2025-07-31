import { DeleteMenuOnlineController } from "./Controller";
import { DeleteMenuOnlineUseCase } from "./UseCase";

export const deleteMenuOnlineController = DeleteMenuOnlineController(
  new DeleteMenuOnlineUseCase()
).execute;

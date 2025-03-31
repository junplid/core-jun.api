import { DeleteFastMessageController } from "./Controller";
import { DeleteFastMessageUseCase } from "./UseCase";

export const deleteFastMessageController = DeleteFastMessageController(
  new DeleteFastMessageUseCase()
).execute;

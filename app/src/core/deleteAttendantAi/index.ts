import { DeleteAtendantAiController } from "./Controller";
import { DeleteAtendantAiUseCase } from "./UseCase";

export const deleteAtendantAiController = DeleteAtendantAiController(
  new DeleteAtendantAiUseCase()
).execute;

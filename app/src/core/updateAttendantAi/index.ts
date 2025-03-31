import { UpdateAttendantAiController } from "./Controller";
import { UpdateAttendantAiUseCase } from "./UseCase";

export const updateAttendantAiController = UpdateAttendantAiController(
  new UpdateAttendantAiUseCase()
).execute;

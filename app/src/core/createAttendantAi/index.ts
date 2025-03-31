import { CreateAttendantAiController } from "./Controller";
import { CreateAttendantAiUseCase } from "./UseCase";

export const createAttendantAiController = CreateAttendantAiController(
  new CreateAttendantAiUseCase()
).execute;

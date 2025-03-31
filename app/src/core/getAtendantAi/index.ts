import { GetAttendantAiController } from "./Controller";
import { GetAttendantAiUseCase } from "./UseCase";

export const getAttendantAiController = GetAttendantAiController(
  new GetAttendantAiUseCase()
).execute;

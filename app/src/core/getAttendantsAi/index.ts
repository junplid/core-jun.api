import { GetAttendantsAiController } from "./Controller";
import { GetAttendantsAiUseCase } from "./UseCase";

export const getAttendantsAiController = GetAttendantsAiController(
  new GetAttendantsAiUseCase()
).execute;

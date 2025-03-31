import { GetAttendantAiDetailsController } from "./Controller";
import { GetAttendantAiDetailsUseCase } from "./UseCase";

export const getAttendantAiDetailsController = GetAttendantAiDetailsController(
  new GetAttendantAiDetailsUseCase()
).execute;

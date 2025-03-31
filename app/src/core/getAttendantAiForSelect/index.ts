import { GetAttendantAiForSelectController } from "./Controller";
import { GetAttendantAiForSelectUseCase } from "./UseCase";

export const getAttendantAiForSelectController =
  GetAttendantAiForSelectController(
    new GetAttendantAiForSelectUseCase()
  ).execute;

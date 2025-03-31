import { CreateCloneSectorAttendantController } from "./Controller";
import { CreateCloneSectorAttendantUseCase } from "./UseCase";

export const createCloneSectorAttendantController =
  CreateCloneSectorAttendantController(
    new CreateCloneSectorAttendantUseCase()
  ).execute;

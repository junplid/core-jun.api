import { CreateCloneAttendantAiController } from "./Controller";
import { CreateCloneAttendantAiUseCase } from "./UseCase";

export const createCloneAttendantAiController =
  CreateCloneAttendantAiController(new CreateCloneAttendantAiUseCase()).execute;

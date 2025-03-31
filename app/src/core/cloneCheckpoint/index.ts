import { CloneCheckpointController } from "./Controller";
import { CloneCheckpointUseCase } from "./UseCase";

export const cloneCheckpointController = CloneCheckpointController(
  new CloneCheckpointUseCase()
).execute;

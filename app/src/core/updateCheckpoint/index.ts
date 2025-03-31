import { UpdateCheckpointController } from "./Controller";
import { UpdateCheckpointUseCase } from "./UseCase";

export const updateCheckpointController = UpdateCheckpointController(
  new UpdateCheckpointUseCase()
).execute;

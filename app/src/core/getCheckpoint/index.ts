import { GetCheckpointController } from "./Controller";
import { GetCheckpointUseCase } from "./UseCase";

export const getCheckpointController = GetCheckpointController(
  new GetCheckpointUseCase()
).execute;

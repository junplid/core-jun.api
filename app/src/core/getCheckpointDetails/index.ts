import { GetCheckpointDetailsController } from "./Controller";
import { GetCheckpointDetailsUseCase } from "./UseCase";

export const getCheckpointDetailsController = GetCheckpointDetailsController(
  new GetCheckpointDetailsUseCase()
).execute;

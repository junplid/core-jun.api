import { UpdateConnectionWAController } from "./Controller";
import { UpdateConnectionWAUseCase } from "./UseCase";

export const updateConnectionWAController = UpdateConnectionWAController(
  new UpdateConnectionWAUseCase()
).execute;

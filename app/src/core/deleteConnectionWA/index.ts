import { DeleteConnectionWAController } from "./Controller";
import { DeleteConnectionWAUseCase } from "./UseCase";

export const deleteConnectionWAController = DeleteConnectionWAController(
  new DeleteConnectionWAUseCase()
).execute;

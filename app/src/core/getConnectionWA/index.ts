import { GetConnectionWAController } from "./Controller";
import { GetConnectionWAUseCase } from "./UseCase";

export const getConnectionWAController = GetConnectionWAController(
  new GetConnectionWAUseCase()
).execute;

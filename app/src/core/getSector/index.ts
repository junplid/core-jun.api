import { GetSectorController } from "./Controller";
import { GetSectorUseCase } from "./UseCase";

export const getSectorController = GetSectorController(
  new GetSectorUseCase()
).execute;

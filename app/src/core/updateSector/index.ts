import { UpdateSectorController } from "./Controller";
import { UpdateSectorUseCase } from "./UseCase";

export const updateSectorController = UpdateSectorController(
  new UpdateSectorUseCase()
).execute;

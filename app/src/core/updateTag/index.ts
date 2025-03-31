import { UpdateTagController } from "./Controller";
import { UpdateTagUseCase } from "./UseCase";

export const updateTagController = UpdateTagController(
  new UpdateTagUseCase()
).execute;

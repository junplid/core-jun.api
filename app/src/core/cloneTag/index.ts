import { CloneTagController } from "./Controller";
import { CloneTagUseCase } from "./UseCase";

export const cloneTagController = CloneTagController(
  new CloneTagUseCase()
).execute;

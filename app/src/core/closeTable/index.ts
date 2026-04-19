import { CloseTableController } from "./Controller";
import { CloseTableUseCase } from "./UseCase";

export const closeTableController = CloseTableController(
  new CloseTableUseCase(),
).execute;

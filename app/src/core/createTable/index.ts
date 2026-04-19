import { CreateTableController } from "./Controller";
import { CreateTableUseCase } from "./UseCase";

export const createTableController = CreateTableController(
  new CreateTableUseCase(),
).execute;

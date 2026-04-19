import { CreateTableItemController } from "./Controller";
import { CreateTableItemUseCase } from "./UseCase";

export const createTableItemController = CreateTableItemController(
  new CreateTableItemUseCase(),
).execute;

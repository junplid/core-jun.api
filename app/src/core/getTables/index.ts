import { GetTablesController } from "./Controller";
import { GetTablesUseCase } from "./UseCase";

export const getTablesController = GetTablesController(
  new GetTablesUseCase(),
).execute;

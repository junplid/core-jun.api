import { GetGeralLogsController } from "./Controller";
import { GetGeralLogsUseCase } from "./UseCase";

export const getGeralLogsController = GetGeralLogsController(
  new GetGeralLogsUseCase()
).execute;

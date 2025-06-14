import { GetInboxDepartmentsController } from "./Controller";
import { GetInboxDepartmentsUseCase } from "./UseCase";

export const getInboxDepartmentsController = GetInboxDepartmentsController(
  new GetInboxDepartmentsUseCase()
).execute;

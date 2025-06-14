import { GetInboxDepartmentController } from "./Controller";
import { GetInboxDepartmentUseCase } from "./UseCase";

export const getInboxDepartmentController = GetInboxDepartmentController(
  new GetInboxDepartmentUseCase()
).execute;

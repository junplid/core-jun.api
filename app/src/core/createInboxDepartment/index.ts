import { CreateInboxDepartmentController } from "./Controller";
import { CreateInboxDepartmentUseCase } from "./UseCase";

export const createInboxDepartmentController = CreateInboxDepartmentController(
  new CreateInboxDepartmentUseCase()
).execute;

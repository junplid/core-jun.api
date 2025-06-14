import { DeleteInboxDepartmentController } from "./Controller";
import { DeleteInboxDepartmentUseCase } from "./UseCase";

export const deleteInboxDepartmentController = DeleteInboxDepartmentController(
  new DeleteInboxDepartmentUseCase()
).execute;

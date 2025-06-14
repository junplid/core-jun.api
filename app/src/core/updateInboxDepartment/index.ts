import { UpdateInboxDepartmentController } from "./Controller";
import { UpdateInboxDepartmentUseCase } from "./UseCase";

export const updateInboxDepartmentController = UpdateInboxDepartmentController(
  new UpdateInboxDepartmentUseCase()
).execute;

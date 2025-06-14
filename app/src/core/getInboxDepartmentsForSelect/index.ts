import { GetInboxDepartmentsForSelectController } from "./Controller";
import { GetInboxDepartmentsForSelectUseCase } from "./UseCase";

export const getInboxDepartmentsForSelectController =
  GetInboxDepartmentsForSelectController(
    new GetInboxDepartmentsForSelectUseCase()
  ).execute;

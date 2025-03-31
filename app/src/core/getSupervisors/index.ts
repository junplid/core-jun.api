import { GetSupervisorsController } from "./Controller";
import { GetSupervisorsUseCase } from "./UseCase";

export const getSupervisorsController = GetSupervisorsController(
  new GetSupervisorsUseCase()
).execute;

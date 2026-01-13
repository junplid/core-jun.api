import { GetAppointmentsController } from "./Controller";
import { GetAppointmentsUseCase } from "./UseCase";

export const getAppointmentsController = GetAppointmentsController(
  new GetAppointmentsUseCase()
).execute;

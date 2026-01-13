import { GetAppointmentDetailsController } from "./Controller";
import { GetAppointmentDetailsUseCase } from "./UseCase";

export const getAppointmentDetailsController = GetAppointmentDetailsController(
  new GetAppointmentDetailsUseCase()
).execute;

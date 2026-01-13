import { UpdateAppointmentController } from "./Controller";
import { UpdateAppointmentUseCase } from "./UseCase";

export const updateAppointmentController = UpdateAppointmentController(
  new UpdateAppointmentUseCase()
).execute;

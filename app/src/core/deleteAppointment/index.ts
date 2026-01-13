import { DeleteAppointmentController } from "./Controller";
import { DeleteAppointmentUseCase } from "./UseCase";

export const deleteAppointmentController = DeleteAppointmentController(
  new DeleteAppointmentUseCase()
).execute;

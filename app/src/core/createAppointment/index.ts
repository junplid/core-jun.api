import { CreateAppointmentController } from "./Controller";
import { CreateAppointmentUseCase } from "./UseCase";

export const createAppointmentController = CreateAppointmentController(
  new CreateAppointmentUseCase(),
).execute;

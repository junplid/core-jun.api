import { StatusAppointments } from "@prisma/client";

export interface UpdateAppointmentParamsDTO_I {
  id: number;
}

export interface UpdateAppointmentQueryDTO_I {
  title?: string;
  desc?: string;
  startAt?: Date;
  status?: StatusAppointments;
}

export interface UpdateAppointmentBodyDTO_I {
  accountId: number;
}

export type UpdateAppointmentDTO_I = UpdateAppointmentBodyDTO_I &
  UpdateAppointmentParamsDTO_I &
  UpdateAppointmentQueryDTO_I;

import { StatusAppointments } from "@prisma/client";

export interface UpdateAppointmentParamsDTO_I {
  id: number;
}

export interface UpdateAppointmentQueryDTO_I {
  title: string;
  desc?: string;
  startAt: Date;
  endAt:
    | "10min"
    | "30min"
    | "1h"
    | "1h e 30min"
    | "2h"
    | "3h"
    | "4h"
    | "5h"
    | "10h"
    | "15h"
    | "1d"
    | "2d";
  status?: StatusAppointments;
  socketIgnore?: string;
}

export interface UpdateAppointmentBodyDTO_I {
  accountId: number;
}

export type UpdateAppointmentDTO_I = UpdateAppointmentBodyDTO_I &
  UpdateAppointmentParamsDTO_I &
  UpdateAppointmentQueryDTO_I;

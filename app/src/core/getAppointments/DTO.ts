import { StatusAppointments } from "@prisma/client";

export interface GetAppointmentsQueryDTO_I {
  limit?: number;
  status?: StatusAppointments[];
}

export interface GetAppointmentsBodyDTO_I {
  accountId: number;
}

export type GetAppointmentsDTO_I = GetAppointmentsBodyDTO_I &
  GetAppointmentsQueryDTO_I;

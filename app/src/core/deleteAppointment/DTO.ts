export interface DeleteAppointmentParamsDTO_I {
  id: number;
}

export interface DeleteAppointmentQueryDTO_I {
  socketIgnore?: string;
  message?: string;
}

export interface DeleteAppointmentBodyDTO_I {
  accountId: number;
}

export type DeleteAppointmentDTO_I = DeleteAppointmentBodyDTO_I &
  DeleteAppointmentParamsDTO_I &
  DeleteAppointmentQueryDTO_I;

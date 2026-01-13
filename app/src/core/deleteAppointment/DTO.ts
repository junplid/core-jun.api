export interface DeleteAppointmentParamsDTO_I {
  id: number;
}

export interface DeleteAppointmentBodyDTO_I {
  accountId: number;
}

export type DeleteAppointmentDTO_I = DeleteAppointmentBodyDTO_I &
  DeleteAppointmentParamsDTO_I;

export interface GetAppointmentDetailsParamsDTO_I {
  id: number;
}

export interface GetAppointmentDetailsBodyDTO_I {
  accountId: number;
}

export type GetAppointmentDetailsDTO_I = GetAppointmentDetailsBodyDTO_I &
  GetAppointmentDetailsParamsDTO_I;

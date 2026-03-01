export interface CreateAppointmentDTO_I {
  accountId: number;
  title: string;
  desc?: string;
  dateStartAt: string;
  timeStartAt: string;
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
  socketIgnore?: string;
}

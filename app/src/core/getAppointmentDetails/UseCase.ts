import { GetAppointmentDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetAppointmentDetailsUseCase {
  constructor() {}

  async run(dto: GetAppointmentDetailsDTO_I) {
    try {
      const appointments = await prisma.appointments.findFirst({
        where: { ...dto, deleted: false },
        select: {
          id: true,
          desc: true,
          title: true,
          startAt: true,
          ConnectionWA: { select: { name: true, id: true } },
          ConnectionIg: { select: { ig_username: true, id: true } },
          // endAt: true,
          Business: { select: { name: true, id: true } },
          n_appointment: true,
          createAt: true,
          createdBy: true,
          actionChannels: true,
          status: true,
          appointmentReminders: { select: { status: true } },
          ContactsWAOnAccount: {
            select: {
              name: true,
              ContactsWA: { select: { completeNumber: true } },
              Tickets: {
                where: { status: { notIn: ["DELETED", "RESOLVED"] } },
                select: {
                  ConnectionWA: { select: { name: true, id: true } },
                  ConnectionIg: { select: { ig_username: true, id: true } },
                  id: true,
                  InboxDepartment: { select: { name: true } },
                  status: true,
                  Messages: {
                    take: 1,
                    orderBy: { id: "desc" },
                    select: { by: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!appointments) {
        throw new ErrorResponse(404).toast({
          title: "Compromisso não encontrado",
          type: "error",
        });
      }

      const {
        ConnectionWA,
        ConnectionIg,
        ContactsWAOnAccount,
        Business,
        appointmentReminders,
        ...ap
      } = appointments;

      let connection: any = {};

      if (ConnectionWA?.name) {
        connection = {
          s: !!cacheConnectionsWAOnline.get(ConnectionWA?.id),
          ...ConnectionWA,
          channel: "baileys",
        };
      }

      if (ConnectionIg?.ig_username) {
        connection = {
          s: true,
          name: ConnectionIg.ig_username,
          id: ConnectionIg.id,
          channel: "instagram",
        };
      }

      const nextAppointment = {
        ...ap,
        business: Business,
        contactName: ContactsWAOnAccount?.name,
        reminders: appointmentReminders.reduce(
          (ac, cr) => {
            if (cr.status === "failed") ac.failed += 1;
            if (cr.status === "failed") ac.sent += 1;
            return ac;
          },
          { sent: 0, failed: 0 },
        ),
        connection,
        ticket:
          ContactsWAOnAccount?.Tickets.map((tk) => {
            let connection2: any = {};

            if (tk.ConnectionWA?.name) {
              connection2 = {
                s: !!cacheConnectionsWAOnline.get(tk.ConnectionWA?.id),
                ...tk.ConnectionWA,
                channel: "baileys",
              };
            }

            if (tk.ConnectionIg?.ig_username) {
              connection2 = {
                s: true,
                name: tk.ConnectionIg.ig_username,
                id: tk.ConnectionIg.id,
                channel: "instagram",
              };
            }

            return {
              connection: connection2,
              id: tk.id,
              // lastMessage: tk.Messages[0].by,
              departmentName: tk.InboxDepartment.name,
              status: tk.status,
            };
          }) || [],
      };

      return {
        message: "OK!",
        status: 200,
        appointment: nextAppointment,
      };
    } catch (error) {
      // console.log(error);
      throw new ErrorResponse(400).toast({
        title: "Não foi possivel achar o compromisso.",
        type: "error",
      });
    }
  }
}

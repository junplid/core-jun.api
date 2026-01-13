import moment, { Moment } from "moment-timezone";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateAppointmentDTO_I } from "./DTO";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { socketIo } from "../../infra/express";

export class UpdateAppointmentUseCase {
  constructor() {}

  async run({ accountId, id, startAt, ...dto }: UpdateAppointmentDTO_I) {
    const exist = await prisma.appointments.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Compromisso não encontrado.`,
        type: "error",
      });
    }

    try {
      let nextStartAt: Moment | undefined = undefined;

      if (startAt) {
        nextStartAt = moment(startAt).tz("America/Sao_Paulo").add(3, "hour");
      }

      const appointment = await prisma.appointments.update({
        where: { id },
        data: { ...dto, startAt: nextStartAt?.toDate() },
        select: { title: true, desc: true, startAt: true },
      });

      cacheAccountSocket.get(accountId)?.listSocket?.forEach(async (sockId) => {
        socketIo.to(sockId.id).emit(`appointment:update`, {
          accountId: accountId,
          data: { id, ...appointment },
        });
      });

      if (nextStartAt) {
        const isEqual = moment(nextStartAt).isSame(appointment.startAt);

        if (!isEqual) {
          const current = moment().tz("America/Sao_Paulo");
          const min = nextStartAt.subtract(30, "minute");
          const diffMin = min.diff(current, "minute");
          const dateReminders: { notify_at: Date; moment: string }[] = [];

          if (diffMin >= 0) {
            dateReminders.push({
              notify_at: min.toDate(),
              moment: "minute",
            });

            const hour = nextStartAt.subtract(2, "hour");
            const diffHour = hour.diff(current, "minute") / 60;
            if (diffHour >= 0) {
              dateReminders.push({
                notify_at: hour.toDate(),
                moment: "hour",
              });

              const day = nextStartAt.subtract(1, "day").add(2, "hour");
              const diffDay = day.diff(current, "hour");

              if (diffDay >= 0) {
                dateReminders.push({
                  notify_at: day.toDate(),
                  moment: "day",
                });
              }
            }
          }
          if (dateReminders.length) {
            await prisma.appointmentReminders.deleteMany({
              where: { appointmentId: id },
            });
            await prisma.appointmentReminders.createMany({
              data: dateReminders.map((d) => ({
                ...d,
                appointmentId: id,
              })),
            });
          }
        }
      }

      return {
        message: "OK!",
        status: 200,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar compromisso!`,
        type: "error",
      });
    }
  }
}

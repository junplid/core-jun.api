import { NodeUpdateAppointmentData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { StatusAppointments } from "@prisma/client";
import moment, { Moment } from "moment-timezone";
import { NotificationApp } from "../../../utils/notificationApp";
import { webSocketEmitToRoom } from "../../../infra/websocket";

interface PropsUpdateOrder {
  numberLead: string;
  contactsWAOnAccountId: number;
  data: NodeUpdateAppointmentData;
  accountId: number;
  nodeId: string;
  isIA?: boolean;
}

export const NodeUpdateAppointment = async (
  props: PropsUpdateOrder,
): Promise<
  | { n: "not_found" | "ok" }
  | {
      n: "no_transfer" | "transfer";
      nodeId: string;
      status: StatusAppointments;
    }
> => {
  try {
    const {
      transfer_direction,
      fields,
      n_appointment,
      startAt,
      endAt,
      notify,
      reminders,
      ...restData
    } = props.data;

    let nextStart = "";
    if (startAt) {
      nextStart = await resolveTextVariables({
        accountId: props.accountId,
        text: nextStart,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    const n_appointment2 = await resolveTextVariables({
      accountId: props.accountId,
      text: n_appointment,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      nodeId: props.nodeId,
      numberLead: props.numberLead,
    });
    const getAppointment = await prisma.appointments.findFirst({
      where: { n_appointment: n_appointment2 },
      select: { id: true, startAt: true, endAt: true },
    });

    if (!getAppointment) return { n: "not_found" };

    if (fields?.includes("title")) {
      restData.title = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.title || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("status")) {
      restData.status = restData.status || "pending_confirmation";
    }

    if (fields?.includes("desc")) {
      restData.desc = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.desc || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("actionChannels")) {
      restData.actionChannels = restData.actionChannels?.length
        ? restData?.actionChannels
        : [];
    }

    let nextStartAt: Moment | undefined = undefined;
    let nextEndAt: Moment | undefined = undefined;
    let dateReminders: { notify_at: Date; moment: string }[] = [];

    const isCanceled =
      restData.status === "expired" || restData.status === "canceled";

    if (!isCanceled) {
      if (fields?.includes("startAt") && !reminders?.length) {
        const startAt2 = moment.tz(nextStart, "America/Sao_Paulo").utc();
        const current = moment();
        const min = startAt2.clone().subtract(30, "minute");
        const diffMin = min.diff(current, "minute");

        if (diffMin >= 0) {
          dateReminders.push({
            notify_at: min.toDate(),
            moment: "minute",
          });

          const hour = startAt2.clone().subtract(2, "hour");
          const diffHour = hour.diff(current, "minute") / 60;
          if (diffHour >= 0) {
            dateReminders.push({
              notify_at: hour.toDate(),
              moment: "hour",
            });

            const day = startAt2.clone().subtract(1, "day");
            const diffDay = day.diff(current, "hour");

            if (diffDay >= 0) {
              dateReminders.push({
                notify_at: day.toDate(),
                moment: "day",
              });
            }
          }
        }
      }
      if (reminders?.length) {
        dateReminders = reminders.map((s) => ({
          moment: "feito_por_agente",
          notify_at: moment.tz(s, "America/Sao_Paulo").utc().toDate(),
        }));
      }

      if (fields?.includes("startAt") && !fields?.includes("endAt")) {
        nextStartAt = moment.tz(nextStart, "America/Sao_Paulo");
        const currentStartAt = moment(getAppointment.startAt);
        const diffMinutes = moment(getAppointment.endAt).diff(currentStartAt);
        nextEndAt = nextStartAt.add(diffMinutes, "minute");
      }

      if (fields?.includes("startAt") && fields?.includes("endAt")) {
        nextStartAt = moment.tz(nextStart, "America/Sao_Paulo");

        if (endAt === "10min") {
          nextEndAt = nextStartAt.add(10, "minute");
        } else if (endAt === "30min") {
          nextEndAt = nextStartAt.add(30, "minute");
        } else if (endAt === "1h") {
          nextEndAt = nextStartAt.add(1, "h");
        } else if (endAt === "1h e 30min") {
          nextEndAt = nextStartAt.add(90, "minute");
        } else if (endAt === "2h") {
          nextEndAt = nextStartAt.add(2, "h");
        } else if (endAt === "3h") {
          nextEndAt = nextStartAt.add(3, "h");
        } else if (endAt === "4h") {
          nextEndAt = nextStartAt.add(4, "h");
        } else if (endAt === "5h") {
          nextEndAt = nextStartAt.add(5, "h");
        } else if (endAt === "10h") {
          nextEndAt = nextStartAt.add(10, "h");
        } else if (endAt === "15h") {
          nextEndAt = nextStartAt.add(15, "h");
        } else if (endAt === "1d") {
          nextEndAt = nextStartAt.add(1, "day");
        } else if (endAt === "2d") {
          nextEndAt = nextStartAt.add(2, "day");
        }
      }

      if (!fields?.includes("startAt") && fields?.includes("endAt")) {
        const currentStartAt = moment(getAppointment.startAt);

        if (endAt === "10min") {
          nextEndAt = currentStartAt.add(10, "minute");
        } else if (endAt === "30min") {
          nextEndAt = currentStartAt.add(30, "minute");
        } else if (endAt === "1h") {
          nextEndAt = currentStartAt.add(1, "h");
        } else if (endAt === "1h e 30min") {
          nextEndAt = currentStartAt.add(90, "minute");
        } else if (endAt === "2h") {
          nextEndAt = currentStartAt.add(2, "h");
        } else if (endAt === "3h") {
          nextEndAt = currentStartAt.add(3, "h");
        } else if (endAt === "4h") {
          nextEndAt = currentStartAt.add(4, "h");
        } else if (endAt === "5h") {
          nextEndAt = currentStartAt.add(5, "h");
        } else if (endAt === "10h") {
          nextEndAt = currentStartAt.add(10, "h");
        } else if (endAt === "15h") {
          nextEndAt = currentStartAt.add(15, "h");
        } else if (endAt === "1d") {
          nextEndAt = currentStartAt.add(1, "day");
        } else if (endAt === "2d") {
          nextEndAt = currentStartAt.add(2, "day");
        }
      }
    }

    const {
      flowNodeId,
      startAt: startAtCurrent,
      id,
    } = await prisma.appointments.update({
      where: { id: getAppointment.id },
      data: {
        title: restData.title || undefined,
        desc: restData.desc || undefined,
        status: restData.status || undefined,
        startAt: nextStartAt ? nextStartAt.toDate() : undefined,
        endAt: nextEndAt ? nextEndAt.toDate() : undefined,
        actionChannels: restData.actionChannels?.map((s) => s.text),
      },
      select: { flowNodeId: true, startAt: true, id: true },
    });

    if (isCanceled || dateReminders.length) {
      await prisma.appointmentReminders.deleteMany({
        where: { appointmentId: getAppointment.id },
      });
    }
    if (dateReminders.length) {
      await prisma.appointmentReminders.createMany({
        data: dateReminders.map((d) => ({
          ...d,
          appointmentId: getAppointment.id,
        })),
      });
    }

    if (isCanceled) {
      const resolvedate = moment(startAtCurrent)
        .tz("America/Sao_Paulo")
        .format("HH:mm YYYY-MM-DD");
      await NotificationApp({
        accountId: props.accountId,
        title_txt: "❌ Agendamento cancelado",
        body_txt: `Data: ${resolvedate}`,
        tag: `appointment-cancel-${id}`,
        onFilterSocket: () => [],
        url_redirect: "/auth/appointments",
      });
    }

    webSocketEmitToRoom()
      .account(props.accountId)
      .appointments.update(
        {
          id: getAppointment.id,
          ...(fields?.includes("title") && { title: restData.title }),
          ...(fields?.includes("status") && { status: restData.status }),
          ...(fields?.includes("desc") && { desc: restData.desc }),
          ...(nextStartAt && { startAt: nextStartAt.toDate() }),
          ...(nextEndAt && { endAt: nextEndAt.toDate() }),
        },
        [],
      );

    if (props.isIA) return { n: "ok" };

    if (!!restData.status) {
      return {
        n: transfer_direction ? "transfer" : "no_transfer",
        nodeId: flowNodeId!,
        status: restData.status,
      };
    }

    return { n: "ok" };
  } catch (error) {
    console.log(error);
    return { n: "not_found" };
  }
};

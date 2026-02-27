import { NodeUpdateAppointmentData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { socketIo } from "../../../infra/express";
import { StatusAppointments } from "@prisma/client";
import moment from "moment-timezone";
import { NotificationApp } from "../../../utils/notificationApp";

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
      notify,
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
      select: { id: true },
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

    let nextStartAt: Date | undefined = undefined;
    let dateReminders: { notify_at: Date; moment: string }[] = [];

    const isCanceled =
      restData.status === "expired" || restData.status === "canceled";

    if (!isCanceled) {
      if (fields?.includes("startAt")) {
        const startAt2 = moment(nextStart)
          .tz("America/Sao_Paulo")
          .add(3, "hour");
        const current = moment().tz("America/Sao_Paulo");
        const min = startAt2.subtract(30, "minute");
        const diffMin = min.diff(current, "minute");

        if (diffMin >= 0) {
          dateReminders.push({
            notify_at: min.toDate(),
            moment: "minute",
          });

          const hour = startAt2.subtract(2, "hour");
          const diffHour = hour.diff(current, "minute") / 60;
          if (diffHour >= 0) {
            dateReminders.push({
              notify_at: hour.toDate(),
              moment: "hour",
            });

            const day = startAt2.subtract(1, "day").add(2, "hour");
            const diffDay = day.diff(current, "hour");

            if (diffDay >= 0) {
              dateReminders.push({
                notify_at: day.toDate(),
                moment: "day",
              });
            }
          }
        }
        nextStartAt = moment(nextStart)
          .tz("America/Sao_Paulo")
          .add(3, "hour")
          .toDate();
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
        startAt: nextStartAt,
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
        .subtract(3, "hour")
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

    cacheAccountSocket
      .get(props.accountId)
      ?.listSocket?.forEach(async (sockId) => {
        socketIo.to(sockId.id).emit(`appointment:update`, {
          accountId: props.accountId,
          data: {
            id: getAppointment.id,
            ...(fields?.includes("title") && { title: restData.title }),
            ...(fields?.includes("desc") && { desc: restData.desc }),
            ...(fields?.includes("title") && { title: restData.title }),
          },
        });
      });

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

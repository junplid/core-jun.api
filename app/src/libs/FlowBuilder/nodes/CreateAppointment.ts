import { NodeCreateAppointmentData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { socketIo } from "../../../infra/express";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import moment from "moment-timezone";

interface PropsCreateOrder {
  numberLead: string;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeCreateAppointmentData;
  accountId: number;
  businessName: string;
  nodeId: string;
  flowStateId: number;
  flowId: string;
  action?: string;
  actions?: {
    onCodeAppointment(code: string): void;
  };
}

export const NodeCreateAppointment = async (
  props: PropsCreateOrder,
): Promise<string | undefined> => {
  try {
    if (props.action) return props.action;

    const n_appointment = genNumCode(7);
    props.actions?.onCodeAppointment(n_appointment);
    const {
      actionChannels,
      varId_save_nAppointment,
      reminders,
      startAt,
      ...restData
    } = props.data;

    if (restData.title) {
      restData.title = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.title,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    let nextStart = "";
    if (startAt) {
      nextStart = await resolveTextVariables({
        accountId: props.accountId,
        text: startAt,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (restData.desc) {
      restData.desc = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.desc,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    let dateReminders: { notify_at: Date; moment: string }[] = [];

    if (!reminders?.length) {
      const startAt2 = moment(nextStart).tz("America/Sao_Paulo").add(3, "hour");
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
    } else {
      dateReminders = reminders.map((s) => ({
        moment: "feito_por_agente",
        notify_at: moment(s).tz("America/Sao_Paulo").add(3, "hour").toDate(),
      }));
    }
    const nextStartAt = moment(nextStart)
      .tz("America/Sao_Paulo")
      .add(3, "hour")
      .toDate();

    const { id } = await prisma.appointments.create({
      data: {
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        flowStateId: props.flowStateId,
        flowNodeId: props.nodeId,
        connectionWAId: props.connectionWhatsId,
        flowId: props.flowId,
        n_appointment,
        ...restData,
        startAt: nextStartAt,
        endAt: nextStartAt,
        status: restData.status || "pending_confirmation",
        ...(actionChannels?.length && {
          actionChannels: actionChannels.map((s) => s.text),
        }),
        ...(dateReminders.length && {
          appointmentReminders: { createMany: { data: dateReminders } },
        }),
      },
      select: {
        id: true,
      },
    });

    if (varId_save_nAppointment) {
      const exist = await prisma.variable.findFirst({
        where: { id: varId_save_nAppointment, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: varId_save_nAppointment,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save_nAppointment,
              value: n_appointment,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save_nAppointment,
              value: n_appointment,
            },
          });
        }
      }
    }

    cacheAccountSocket
      .get(props.accountId)
      ?.listSocket?.forEach(async (sockId) => {
        socketIo.to(sockId.id).emit(`appointment:new`, {
          accountId: props.accountId,
          order: {
            id,
            title: restData.title,
            desc: restData.desc,
            startAt: nextStartAt,
          },
        });
      });

    return;
  } catch (error) {
    console.log(error);
    throw "Error";
  }
};

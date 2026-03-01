import { NodeCreateAppointmentData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import moment from "moment-timezone";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { NotificationApp } from "../../../utils/notificationApp";
import { webSocketEmitToRoom } from "../../../infra/websocket";

type PropsCreateOrder =
  | {
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

      external_adapter:
        | { type: "baileys" }
        | { type: "instagram"; page_token: string };
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
      actions?: {
        onCodeAppointment(code: string): void;
      };
    };

export const NodeCreateAppointment = async (
  props: PropsCreateOrder,
): Promise<string | undefined> => {
  if (props.mode === "testing") {
    const n_appointment = genNumCode(7);
    props.actions?.onCodeAppointment(n_appointment);
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: `Tentou atualizar agendamento(${n_appointment}), mas só funciona apenas em chat real`,
      mode: "testing",
    });

    return;
  }

  try {
    if (props.action) return props.action;

    const n_appointment = genNumCode(7);
    props.actions?.onCodeAppointment(n_appointment);
    const {
      actionChannels,
      varId_save_nAppointment,
      reminders,
      startAt,
      endAt,
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
    } else {
      dateReminders = reminders.map((s) => ({
        moment: "feito_por_agente",
        notify_at: moment.tz(s, "America/Sao_Paulo").utc().toDate(),
      }));
    }
    const nextStartAt = moment.tz(nextStart, "America/Sao_Paulo").utc();
    const nextEndAt = nextStartAt.clone();
    if (endAt) {
      if (endAt === "10min") {
        nextEndAt.add(10, "minute");
      } else if (endAt === "30min") {
        nextEndAt.add(30, "minute");
      } else if (endAt === "1h") {
        nextEndAt.add(1, "h");
      } else if (endAt === "1h e 30min") {
        nextEndAt.add(90, "minute");
      } else if (endAt === "2h") {
        nextEndAt.add(2, "h");
      } else if (endAt === "3h") {
        nextEndAt.add(3, "h");
      } else if (endAt === "4h") {
        nextEndAt.add(4, "h");
      } else if (endAt === "5h") {
        nextEndAt.add(5, "h");
      } else if (endAt === "10h") {
        nextEndAt.add(10, "h");
      } else if (endAt === "15h") {
        nextEndAt.add(15, "h");
      } else if (endAt === "1d") {
        nextEndAt.add(1, "day");
      } else if (endAt === "2d") {
        nextEndAt.add(2, "day");
      }
    } else {
      nextEndAt.add(1, "h");
    }

    const { id } = await prisma.appointments.create({
      data: {
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        flowStateId: props.flowStateId,
        flowNodeId: props.nodeId,
        flowId: props.flowId,

        n_appointment,
        ...(props.external_adapter.type === "baileys"
          ? { connectionWAId: props.connectionWhatsId }
          : { connectionIgId: props.connectionWhatsId }),

        ...restData,
        startAt: nextStartAt.toDate(),
        endAt: nextEndAt.toDate(),
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

    const now = moment().tz("America/Sao_Paulo");
    const nextStartBR = nextStartAt.clone().tz("America/Sao_Paulo");
    const diffMinutes = nextStartBR.diff(now, "minutes");
    let body_txt = "";

    if (diffMinutes >= 1440) {
      const days = Math.floor(diffMinutes / 1440);
      if (days < 1) {
        body_txt = `Hoje, às ${nextStartBR.format("HH:mm")}`;
      } else if (days === 1) {
        body_txt = `Amanhã, às ${nextStartBR.format("HH:mm")}`;
      } else {
        body_txt = `Em ${days} dia${days > 1 ? "s" : ""}, às ${nextStartBR.format("HH:mm")}`;
      }
    } else if (diffMinutes >= 60) {
      body_txt = `Hoje, às ${nextStartBR.format("HH:mm")}`;
    } else {
      body_txt = `Em ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
    }

    await NotificationApp({
      accountId: props.accountId,
      title_txt: restData.title,
      body_txt,
      tag: `appointment-add-${id}`,
      onFilterSocket: () => [],
      url_redirect: "/auth/appointments",
    });

    webSocketEmitToRoom().account(props.accountId).appointments.new(
      {
        id,
        title: restData.title,
        desc: restData.desc,
        startAt: nextStartAt.toDate(),
        endAt: nextEndAt.toDate(),
        channel: props.external_adapter.type,
      },
      [],
    );

    return;
  } catch (error) {
    console.log(error);
    throw "Error";
  }
};

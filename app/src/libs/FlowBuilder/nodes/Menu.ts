import {
  countAttemptsMenu,
  scheduleExecutionsMenu,
} from "../../../adapters/Baileys/Cache";
import { NodeMenuData } from "../Payload";
import { remove } from "remove-accents";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { NodeMessage } from "./Message";

const getNextTimeOut = (
  type: "minutes" | "hours" | "days" | "seconds",
  value: number,
) => {
  try {
    if (type === "seconds" && value > 1440) value = 1440;
    if (type === "minutes" && value > 10080) value = 10080;
    if (type === "hours" && value > 168) value = 168;
    if (type === "days" && value > 7) value = 7;
    const nowDate = moment().tz("America/Sao_Paulo");
    return new Date(nowDate.add(value, type).toString());
  } catch (error) {
    console.error("Error in getNextTimeOut:", error);
    throw new Error("Failed to calculate next timeout");
  }
};

interface PropsNodeReply {
  lead_id: string;
  contactAccountId: number;
  connectionId: number;
  external_adapter:
    | { type: "baileys" }
    | { type: "instagram"; page_token: string };

  data: NodeMenuData;
  message?: string;
  onExecuteSchedule?: () => Promise<void>;
  action: { onErrorClient?(): void };
  flowStateId: number;
  accountId: number;
  nodeId: string;
}

type ResultPromise =
  | { action: "return" }
  | { action: "failed" }
  | { action: "failAttempt" }
  | { action: "sucess"; sourceHandle: string };

export const NodeMenu = async (
  props: PropsNodeReply,
): Promise<ResultPromise> => {
  const keyMap = `${props.connectionId}+${props.lead_id}`;
  const scheduleExecution = scheduleExecutionsMenu.get(keyMap);
  let countAttempts = countAttemptsMenu.get(keyMap) || 0;

  if (!props.message) {
    if (scheduleExecution) {
      scheduleExecution.cancel();
      scheduleExecutionsMenu.delete(keyMap);
    }
    let text = "";
    if (props.data.header) text = `*${props.data.header}*\n\n`;
    for (let i = 0; i < props.data.items.length; i++) {
      text += `[${i + 1}] - ${props.data.items[i].value}\n`;
    }
    if (props.data.footer) text += `\n_${props.data.footer}_`;

    await NodeMessage({
      accountId: props.accountId,
      action: props.action,
      sendBy: "bot",
      connectionId: props.connectionId,
      contactAccountId: props.contactAccountId,
      data: {
        messages: [
          {
            key: "1",
            text,
            interval: props.data.interval
              ? Number(props.data.interval)
              : undefined,
          },
        ],
      },
      external_adapter: props.external_adapter,
      flowStateId: props.flowStateId,
      lead_id: props.lead_id,
      nodeId: props.nodeId,
    });

    if (props.onExecuteSchedule) {
      const { type, value } = props.data.timeout || {};
      const nextTimeStart = getNextTimeOut(
        type?.length ? type[0] : "minutes",
        Math.max(value || 1, 0),
      );
      const timeOnExecuteActionTimeOut = scheduleJob(
        nextTimeStart,
        props.onExecuteSchedule,
      );
      scheduleExecutionsMenu.set(keyMap, timeOnExecuteActionTimeOut);
    }
    return { action: "return" };
  }

  const isNumber = !isNaN(Number(props.message));

  const messageErrorAttempts = props.data.validateReply?.messageErrorAttempts;

  if (!isNumber) {
    const message = remove(props.message).toLowerCase();

    const isActivatedItem = props.data.items.some((item) => {
      return remove(item.value).toLowerCase() === message;
    });

    if (!isActivatedItem) {
      if (!countAttempts) {
        countAttemptsMenu.set(keyMap, 1);
      } else {
        countAttempts += 1;
        countAttemptsMenu.set(keyMap, countAttempts);
      }

      if (messageErrorAttempts?.value) {
        try {
          await NodeMessage({
            accountId: props.accountId,
            action: props.action,
            connectionId: props.connectionId,
            contactAccountId: props.contactAccountId,
            sendBy: "bot",
            data: {
              messages: [
                {
                  key: "1",
                  text: messageErrorAttempts.value,
                  interval: messageErrorAttempts.interval
                    ? Number(messageErrorAttempts.interval)
                    : undefined,
                },
              ],
            },
            external_adapter: props.external_adapter,
            flowStateId: props.flowStateId,
            lead_id: props.lead_id,
            nodeId: props.nodeId,
          });
        } catch (error) {
          console.log(error);
          props.action.onErrorClient?.();
          throw new Error("Failed to send message");
        }
      }

      const attempts = props.data.validateReply?.attempts || 0;
      if (attempts && countAttempts >= attempts) {
        countAttemptsMenu.delete(keyMap);
        return { action: "failed" };
      }
      return { action: "failAttempt" };
    }

    scheduleExecution?.cancel();
    countAttemptsMenu.delete(keyMap);
    const activatedItem = props.data.items.find((item) => {
      return remove(item.value).toLowerCase() === message;
    })!;

    return { action: "sucess", sourceHandle: activatedItem.key };
  } else {
    const msgIndex = Number(props.message);

    const findIndex = props.data.items?.[msgIndex - 1]?.key;
    if (!findIndex) {
      if (!countAttempts) {
        countAttemptsMenu.set(keyMap, 1);
      } else {
        countAttempts += 1;
        countAttemptsMenu.set(keyMap, countAttempts);
      }

      if (messageErrorAttempts?.value) {
        try {
          await NodeMessage({
            accountId: props.accountId,
            action: props.action,
            connectionId: props.connectionId,
            contactAccountId: props.contactAccountId,
            data: {
              messages: [
                {
                  key: "1",
                  text: messageErrorAttempts.value,
                  interval: messageErrorAttempts.interval
                    ? Number(messageErrorAttempts.interval)
                    : undefined,
                },
              ],
            },
            external_adapter: props.external_adapter,
            flowStateId: props.flowStateId,
            lead_id: props.lead_id,
            nodeId: props.nodeId,
            sendBy: "bot",
          });
        } catch (error) {
          props.action.onErrorClient?.();
          console.log(error);
          throw new Error("Failed to send message");
        }
      }

      const attempts = props.data.validateReply?.attempts || 0;
      if (attempts && countAttempts >= attempts) {
        countAttemptsMenu.delete(keyMap);
        return { action: "failed" };
      }
      return { action: "failAttempt" };
    }

    scheduleExecution?.cancel();
    countAttemptsMenu.delete(keyMap);
    return { action: "sucess", sourceHandle: findIndex };
  }
};

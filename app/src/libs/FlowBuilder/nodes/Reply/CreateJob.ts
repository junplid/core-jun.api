import { WASocket } from "baileys";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { scheduleExecutionsReply } from "../../../../adapters/Baileys/Cache";
import { baileysWATypingDelay } from "../../../../helpers/typingDelayVenom";
import { TypeNodesPayload } from "../../Payload";
import { TypingDelay } from "../../../../adapters/Baileys/modules/typing";
import { SendMessageText } from "../../../../adapters/Baileys/modules/sendMessage";

const getNextTimeOut = (type: "MINUTES" | "HOURS" | "DAYS", value: number) => {
  if (type === "MINUTES" && value > 10080) value = 10080;
  if (type === "HOURS" && value > 168) value = 168;
  if (type === "DAYS" && value > 7) value = 7;
  const nowDate = moment().tz("America/Sao_Paulo");
  const typeTimeOut = type.toLocaleLowerCase() as "minutes" | "hours" | "days";
  return new Date(nowDate.add(value, typeTimeOut).toString());
};

interface IProps {
  keyMap: string;
  leadNumber: string;
  timeOut?: {
    type?: "MINUTES" | "HOURS" | "DAYS" | undefined;
    value?: number | undefined;
    action?:
      | ({
          interval: number;
          value: string;
        } & (
          | { run: "SUBMIT_FLOW"; submitFlowId: number }
          | { run: "FORK" | "CONTINUE" | "END_FLOW" }
        ))
      | undefined;
  };
  nextEdgesIds: {
    id: string;
    sourceHandle: string | null;
    nodeNextType?: TypeNodesPayload;
  }[];
  onFinish: (s: string) => Promise<void>;
  res(): void;
  isSavePositionLead?: boolean;
  onExecutedNode(): Promise<void>;
  connectionId: number;
  reExecute(nextNode: string): void;
  onFinishFlow(): void;
  onSubmitFlow(): void;
  onForkFlow(): void;
}

export const createJobNodeReply = (props: IProps) => {
  if (!props.timeOut) return;
  const { action, type, value } = props.timeOut;
  if (type && value && action) {
    const nextNumber = value < 1 ? 1 : value;

    const scheduleExecutionCache = scheduleExecutionsReply.get(props.keyMap);
    if (scheduleExecutionCache) {
      scheduleExecutionCache.cancel();
      scheduleExecutionsReply.delete(props.keyMap);
    }
    const nextTimeStart = getNextTimeOut(type, nextNumber);
    const timeOnExecuteActionTimeOut = scheduleJob(nextTimeStart, async () => {
      console.log("EXECUTOU");
      if (action.value) {
        try {
          await TypingDelay({
            delay: action.interval,
            toNumber: props.leadNumber,
            connectionId: props.connectionId,
          });

          await SendMessageText({
            connectionId: props.connectionId,
            text: action.value,
            toNumber: props.leadNumber,
          });
        } catch (error) {
          console.log("Error com modulo da baileys");
          return;
        }
      }
      console.log("AQUI 1");
      // o problme aesta aqui
      if (action!.run === "CONTINUE") {
        const isNextNodeMain = props.nextEdgesIds.find(
          (nh) => !nh.sourceHandle
        )?.id;

        console.log({ isNextNodeMain });

        if (!isNextNodeMain) {
          props.onFinish && (await props.onFinish("192"));
          return props.res();
        }
        if (props.isSavePositionLead) {
          if (props.onExecutedNode) props.onExecutedNode();
        }
        return props.reExecute(isNextNodeMain);
      }

      if (action!.run === "END_FLOW") return props.onFinishFlow();
      if (action!.run === "SUBMIT_FLOW") {
        return props.onSubmitFlow();
      }
      if (action!.run === "FORK") return props.onForkFlow();
    });
    scheduleExecutionsReply.set(props.keyMap, timeOnExecuteActionTimeOut);
  }
};

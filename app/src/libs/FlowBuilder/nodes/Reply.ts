import { scheduleJob } from "node-schedule";
import { scheduleExecutionsReply } from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeReplyData } from "../Payload";
import moment from "moment-timezone";

const getNextTimeOut = (
  type: "MINUTES" | "HOURS" | "DAYS" | "SECONDS",
  value: number
) => {
  try {
    if (type === "SECONDS" && value > 1440) value = 1440;
    if (type === "MINUTES" && value > 10080) value = 10080;
    if (type === "HOURS" && value > 168) value = 168;
    if (type === "DAYS" && value > 7) value = 7;
    const nowDate = moment().tz("America/Sao_Paulo");
    const typeTimeOut = type.toLowerCase() as
      | "minutes"
      | "hours"
      | "days"
      | "seconds";
    return new Date(nowDate.add(value, typeTimeOut).toString());
  } catch (error) {
    console.error("Error in getNextTimeOut:", error);
    throw new Error("Failed to calculate next timeout");
  }
};

interface PropsNodeReply {
  numberLead: string;
  numberConnection: string;
  data?: NodeReplyData;
  message?: string;
  flowStateId: number;
  contactsWAOnAccountId: number;
  accountId: number;
  flowBusinessIds?: number[];
  onExecuteSchedule?: () => Promise<void>;
}

type ResultPromise = { action: "NEXT" | "RETURN"; line?: string };

export const NodeReply = async (
  props: PropsNodeReply
): Promise<ResultPromise> => {
  const { message, data } = props;
  const keyMap = props.numberConnection + props.numberLead;

  const scheduleExecution = scheduleExecutionsReply.get(keyMap);
  if (message) {
    await prisma.messages.create({
      data: {
        by: "contact",
        message,
        type: "text",
        flowStateId: props.flowStateId,
      },
    });
    scheduleExecution?.cancel();

    if (!data?.isSave) {
      scheduleExecution?.cancel();
      return { action: "NEXT", line: "35" };
    }
    for await (const id of data.list || []) {
      const findTypeVar = await prisma.variable.findFirst({
        where: { id },
        select: { type: true },
      });

      if (!findTypeVar || findTypeVar.type !== "dynamics") continue;

      const x = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          variableId: id,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
        },
        select: { id: true },
      });
      if (x) {
        await prisma.contactsWAOnAccountVariable.update({
          where: { id: x.id },
          data: { value: message },
        });
      } else {
        await prisma.contactsWAOnAccountVariable.create({
          data: {
            value: message,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: id,
          },
        });
      }
    }

    return { action: "NEXT", line: "68" };
  }

  if (data?.timeout && !props.message) {
    const { type, value } = data.timeout;
    if (type.length && value) {
      const nextNumber = value < 1 ? 1 : value;
      if (scheduleExecution) {
        scheduleExecution.cancel();
        scheduleExecutionsReply.delete(keyMap);
      }
      if (props.onExecuteSchedule) {
        const nextTimeStart = getNextTimeOut(type[0], nextNumber);
        const timeOnExecuteActionTimeOut = scheduleJob(
          nextTimeStart,
          props.onExecuteSchedule
        );
        scheduleExecutionsReply.set(keyMap, timeOnExecuteActionTimeOut);
        return { action: "RETURN", line: "102" };
      }
    }
    return { action: "NEXT", line: "105" };
  }
  return { action: "NEXT", line: "107" };
};

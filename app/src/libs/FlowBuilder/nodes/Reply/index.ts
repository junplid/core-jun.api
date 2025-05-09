import { WASocket } from "baileys";
import {
  countAttemptsReply,
  isSendMessageOfFailedAttempts,
  scheduleExecutionsReply,
} from "../../../../adapters/Baileys/Cache";
import { prisma } from "../../../../adapters/Prisma/client";
import { NodeReplyData } from "../../Payload";

interface PropsNodeReply {
  numberLead: string;
  numberConnection: string;
  data?: NodeReplyData;
  message: string;
  flowStateId: number;
  contactsWAOnAccountId: number;
  accountId: number;
  flowBusinessIds?: number[];
}

type ResultPromise = { action: "NEXT"; line?: string };

export const NodeReply = (props: PropsNodeReply): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    console.log("================================");
    console.log("Entrou no bloco ded resposta");
    console.log("================================");

    const keyMap = props.numberConnection + props.numberLead;
    const isScheduleExecution = scheduleExecutionsReply.get(keyMap);

    if (!props.data?.isSave) {
      isScheduleExecution?.cancel();
      return res({ action: "NEXT", line: "33" });
    }

    const { message, data } = props;

    for await (const id of data.list || []) {
      const findTypeVar = await prisma.variable.findFirst({
        where: { id },
        select: { type: true },
      });

      if (!findTypeVar || findTypeVar.type !== "dynamics") {
        return res({ action: "NEXT", line: "46" });
      }

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

    const timeOnExecuteActionTimeOut = scheduleExecutionsReply.get(keyMap);

    timeOnExecuteActionTimeOut?.cancel();
    countAttemptsReply.delete(keyMap);
    isSendMessageOfFailedAttempts.delete(keyMap);

    return res({ action: "NEXT", line: "95" });
  });

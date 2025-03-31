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
}

type ResultPromise = { action: "NEXT"; line?: string };

export const NodeReply = (props: PropsNodeReply): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    console.log("================================");
    console.log("================================");
    console.log("Entrou no bloco ded resposta");
    const keyMap = props.numberConnection + props.numberLead;
    const isScheduleExecution = scheduleExecutionsReply.get(keyMap);

    if (!props.data?.isSaveReply) {
      isScheduleExecution?.cancel();
      return res({ action: "NEXT", line: "33" });
    }

    const { message, data } = props;

    console.log("1");

    const businessIdsOnVariable = await prisma.variableOnBusiness.findMany({
      where: {
        variableId: data.variableId,
        Business: { accountId: props.accountId },
        Variable: { type: "dynamics" },
      },
      select: {
        id: true,
        ContactsWAOnAccountVariableOnBusiness: { select: { id: true } },
      },
    });
    console.log("2");

    for await (const propss of businessIdsOnVariable) {
      if (!propss.ContactsWAOnAccountVariableOnBusiness.length) {
        await prisma.contactsWAOnAccountVariableOnBusiness.create({
          data: {
            value: message,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableOnBusinessId: propss.id,
          },
        });
      } else {
        for await (const {
          id,
        } of propss.ContactsWAOnAccountVariableOnBusiness) {
          const alreadyExists =
            await prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
              where: {
                id: id,
                contactsWAOnAccountId: props.contactsWAOnAccountId,
              },
            });
          if (alreadyExists) {
            await prisma.contactsWAOnAccountVariableOnBusiness.update({
              where: { id: id },
              data: { value: message },
            });
          } else {
            await prisma.contactsWAOnAccountVariableOnBusiness.create({
              data: {
                value: message,
                contactsWAOnAccountId: props.contactsWAOnAccountId,
                variableOnBusinessId: propss.id,
              },
            });
          }
        }
      }
    }
    console.log("3");

    const timeOnExecuteActionTimeOut = scheduleExecutionsReply.get(keyMap);

    timeOnExecuteActionTimeOut?.cancel();
    countAttemptsReply.delete(keyMap);
    isSendMessageOfFailedAttempts.delete(keyMap);

    return res({ action: "NEXT", line: "95" });
  });

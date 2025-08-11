import { NodeDeleteMessageData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { DeleteMessage } from "../../../adapters/Baileys/modules/deleteMessage";

interface PropsNodeDeleteMessage {
  numberLead: string;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeDeleteMessageData;
}

export const NodeDeleteMessage = (
  props: PropsNodeDeleteMessage
): Promise<void> => {
  return new Promise(async (res, _rej) => {
    let jid: string = props.numberLead;

    if (props.data.varId_groupJid) {
      const getvalue = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varId_groupJid,
        },
        select: { value: true },
      });
      if (!getvalue?.value) {
        console.log("Não tinha o jig do grupo!");
        return res();
      }
    }

    if (props.data.varId_messageId) {
      const getvalue = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varId_messageId,
        },
        select: { value: true },
      });
      if (!getvalue?.value) {
        console.log("Não tinha o id da mensagem!");
        return res();
      }

      await DeleteMessage({
        connectionId: props.connectionWhatsId,
        messageId: getvalue.value,
        toNumber: jid,
      });
    }
    return res();
  });
};

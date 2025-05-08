import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeMessageData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeMessage {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeMessageData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
}

export const NodeMessage = (props: PropsNodeMessage): Promise<void> => {
  return new Promise(async (res, rej) => {
    if (!props.data.messages?.length) return res();

    for await (const message of props.data.messages) {
      const nextText = await resolveTextVariables({
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        text: message.text,
        ticketProtocol: props.ticketProtocol,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });

      try {
        await TypingDelay({
          delay: Number(message.interval),
          toNumber: props.numberLead,
          connectionId: props.connectionWhatsId,
        });
      } catch (error) {
        rej(error);
      }

      try {
        await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: nextText,
          toNumber: props.numberLead,
        });
        return res();
      } catch (error) {
        console.log("error para enviar a mensagem", error);
        rej("Error ao enviar mensagem");
      }
    }
    return;
  });
};

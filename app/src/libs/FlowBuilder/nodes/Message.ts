import { WASocket } from "baileys";
import { NodeMessageData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeAddVariables } from "./AddVariables";

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
  action: { onErrorClient?(): void };
  flowStateId: number;
}

export const NodeMessage = (props: PropsNodeMessage): Promise<void> => {
  return new Promise(async (res, rej) => {
    console.log(props.data);
    if (!props.data.messages?.length) return res();

    for await (const message of props.data.messages) {
      try {
        await TypingDelay({
          delay: Number(message.interval || 0),
          toNumber: props.numberLead,
          connectionId: props.connectionWhatsId,
        });
      } catch (error) {
        console.log(error);
        props.action.onErrorClient?.();
        rej(error);
      }

      try {
        console.log("1");
        const nextText = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          text: message.text,
          ticketProtocol: props.ticketProtocol,
          numberLead: props.numberLead,
          nodeId: props.nodeId,
        });
        console.log("2", { nextText });
        const msg = await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: nextText,
          toNumber: props.numberLead,
        });
        if (!msg) return rej("Error ao enviar mensagem");
        console.log("3");
        await prisma.messages.create({
          data: {
            by: "bot",
            message: nextText,
            type: "text",
            messageKey: msg.key.id,
            flowStateId: props.flowStateId,
          },
        });
        console.log("4");
        if (message.varId && msg.key.id) {
          await NodeAddVariables({
            data: { list: [{ id: message.varId, value: msg.key.id }] },
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            flowStateId: props.flowStateId,
            nodeId: props.nodeId,
            accountId: props.accountId,
            numberLead: props.numberLead,
          });
        }
        console.log("5");
      } catch (error) {
        props.action.onErrorClient?.();
        console.log("error para enviar a mensagem", error);
        rej("Error ao enviar mensagem");
      }
    }
    return res();
  });
};

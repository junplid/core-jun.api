import { WASocket } from "baileys";
import { NodeSendTextGroupData } from "../Payload";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { prisma } from "../../../adapters/Prisma/client";
import { SendTextGroup } from "../../../adapters/Baileys/modules/sendTextGroup";

interface PropsNodeMessage {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeSendTextGroupData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
  flowStateId: number;
}

export const NodeSendTextGroup = (props: PropsNodeMessage): Promise<void> => {
  return new Promise(async (res, rej) => {
    if (!props.data.messages?.length) return res();

    for await (const message of props.data.messages) {
      try {
        await TypingDelay({
          delay: Number(message.interval || 0),
          toNumber: props.numberLead,
          connectionId: props.connectionWhatsId,
        });
      } catch (error) {
        props.action.onErrorClient?.();
        rej(error);
      }

      try {
        const nextText = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          text: message.text,
          ticketProtocol: props.ticketProtocol,
          numberLead: props.numberLead,
          nodeId: props.nodeId,
        });
        const msg = await SendTextGroup({
          connectionId: props.connectionWhatsId,
          text: nextText,
          groupName: props.data.groupName,
        });
        if (!msg) return rej("Error ao enviar mensagem");
        await prisma.messages.create({
          data: {
            by: "bot",
            message: nextText,
            type: "text",
            messageKey: msg.key.id,
            flowStateId: props.flowStateId,
          },
        });
      } catch (error) {
        props.action.onErrorClient?.();
        console.log("error para enviar a mensagem", error);
        rej("Error ao enviar mensagem");
      }
    }
    return res();
  });
};

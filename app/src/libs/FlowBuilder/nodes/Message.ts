import { NodeMessageData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeAddVariables } from "./AddVariables";
import { sendMetaMarkSeen } from "../../../services/meta/modules/markSeen";
import { sendMetaTextMessage } from "../../../services/meta/modules/sendTextMessage";
import { sendMetaTyping } from "../../../services/meta/modules/typing";
import { isWithin24Hours } from "../../../services/meta/modules/checkWindowDay";

interface PropsNodeMessage {
  lead_id: string;
  contactAccountId: number;
  connectionId: number;
  sendBy: "user" | "bot";
  external_adapter:
    | { type: "baileys" }
    | { type: "instagram"; page_token: string };
  data: NodeMessageData;
  accountId: number;
  ticketProtocol?: string;
  nodeId?: string;
  action: { onErrorClient?(): void };
  flowStateId: number;
}

export const NodeMessage = (props: PropsNodeMessage): Promise<void> => {
  return new Promise(async (res, rej) => {
    if (!props.data.messages?.length) return res();

    for await (const message of props.data.messages) {
      try {
        if (props.external_adapter.type === "baileys") {
          await TypingDelay({
            delay: Number(message.interval || 0),
            toNumber: props.lead_id,
            connectionId: props.connectionId,
          });
        }
        if (props.external_adapter.type === "instagram") {
          await sendMetaMarkSeen({
            page_token: props.external_adapter.page_token!,
            recipient_id: props.lead_id,
          });
          await new Promise((resolve) => setTimeout(resolve, 300));
          await sendMetaTyping({
            page_token: props.external_adapter.page_token,
            recipient_id: props.lead_id,
            delay: Number(message.interval || 0),
          });
        }
      } catch (error) {
        console.log(error);
        props.action.onErrorClient?.();
        rej(error);
      }

      try {
        const nextText = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          text: message.text,
          ticketProtocol: props.ticketProtocol,
          numberLead: props.lead_id,
          nodeId: props.nodeId,
        });
        let msgkey: string | null = null;
        if (props.external_adapter.type === "baileys") {
          const msg = await SendMessageText({
            connectionId: props.connectionId,
            toNumber: props.lead_id,
            text: nextText,
          });
          if (!msg?.key?.id) return rej("Error ao enviar mensagem");
          msgkey = msg?.key?.id;
        }
        if (props.external_adapter.type === "instagram") {
          const ca = await prisma.contactsWAOnAccount.findFirst({
            where: { id: props.contactAccountId },
            select: { last_interaction: true },
          });
          if (!ca?.last_interaction) {
            props.action.onErrorClient?.();
            return rej("Contato não encontrado!");
          }
          if (!isWithin24Hours(ca.last_interaction)) {
            props.action.onErrorClient?.();
            return rej("Fora da janela de 24h!");
          }
          const { message_id } = await sendMetaTextMessage({
            page_token: props.external_adapter.page_token,
            recipient_id: props.lead_id,
            text: nextText,
          });
          msgkey = message_id;
        }
        await prisma.messages.create({
          data: {
            by: props.sendBy,
            message: nextText,
            type: "text",
            messageKey: msgkey,
            flowStateId: props.flowStateId,
          },
        });

        if (message.varId && msgkey && props.nodeId) {
          await NodeAddVariables({
            data: { list: [{ id: message.varId, value: msgkey }] },
            contactAccountId: props.contactAccountId,
            flowStateId: props.flowStateId,
            nodeId: props.nodeId,
            accountId: props.accountId,
            numberLead: props.lead_id,
          });
        }
      } catch (error) {
        props.action.onErrorClient?.();
        rej("Error ao enviar mensagem");
      }
    }
    return res();
  });
};

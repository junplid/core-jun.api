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
import axios from "axios";

type PropsNodeMessage =
  | {
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
      keyControl: string;
      mode: "prod";
    }
  | {
      mode: "testing";
      sendBy: "user" | "bot";
      accountId: number;
      nodeId?: string;
      data: NodeMessageData;
      token_modal_chat_template: string;
      contactAccountId: number;
      lead_id: string;
      keyControl: string;
    };

export const NodeMessage = (
  props: PropsNodeMessage,
): Promise<{
  varTemps: {
    name: string;
    value: string;
  }[];
}> => {
  return new Promise<{
    varTemps: {
      name: string;
      value: string;
    }[];
  }>(async (res, rej) => {
    if (!props.data.messages?.length) return res({ varTemps: [] });

    if (props.mode === "testing") {
      for await (const message of props.data.messages) {
        await TypingDelay({
          delay: Number(message.interval || 0),
          token_modal_chat_template: props.token_modal_chat_template,
          mode: "testing",
          accountId: props.accountId,
        });
        const text = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          text: message.text,
          numberLead: props.lead_id,
          nodeId: props.nodeId,
          keyControl: props.keyControl,
        });
        await SendMessageText({
          token_modal_chat_template: props.token_modal_chat_template,
          role: "agent",
          accountId: props.accountId,
          text,
          mode: "testing",
        });
      }

      return res({ varTemps: [] });
    }

    for await (const message of props.data.messages) {
      try {
        if (props.external_adapter.type === "baileys") {
          await TypingDelay({
            delay: Number(message.interval || 0),
            toNumber: props.lead_id,
            connectionId: props.connectionId,
            mode: "prod",
          });
        }
        if (props.external_adapter.type === "instagram") {
          await axios.post(
            "https://graph.instagram.com/25835836246075233/messages",
            {
              recipient: {
                id: "928692789541890",
              },
              message: {
                text: message.text,
              },
            },
            {
              headers: {
                Authorization: `Bearer IGAAnIjPX8ZAZClBZAFpIYi1oN28xY290RG1mcl9HcDVrcFhqbXhULXpXdXZAuTUNnNDZAzY3diN1d4WHFiRVcybW9uY1FlU1RPd25scU5OdUZA6RnZAMamVCcE9PQ0xzWmVEb2JrblFROHIzLXBCSVdXQXR2OXNoMDhndzJkc2cyekR3cwZDZD`,
              },
            },
          );
          await axios.get(
            "https://graph.instagram.com/me?access_token=IGAAnIjPX8ZAZClBZAGJHNDQ3UE1zTE85S3BPSjdNcXlqUlZAhSDRBNGZAXLXloV1JsTUFaalowcDQ0VzVTSDhjSlE3YlUySVkyYmUxcEpUcW1Vbl9ITTRiaDBHdGhmOFdrTW1HRmJORTVqNk45UEc2bGFHZA3dfdG5CSUlpUEhOS216WQZDZD",

            {
              headers: {
                Authorization: `Bearer IGAAnIjPX8ZAZClBZAGJHNDQ3UE1zTE85S3BPSjdNcXlqUlZAhSDRBNGZAXLXloV1JsTUFaalowcDQ0VzVTSDhjSlE3YlUySVkyYmUxcEpUcW1Vbl9ITTRiaDBHdGhmOFdrTW1HRmJORTVqNk45UEc2bGFHZA3dfdG5CSUlpUEhOS216WQZDZD`,
              },
            },
          );

          await sendMetaMarkSeen({
            page_token:
              "IGAAnIjPX8ZAZClBZAGItZATM5RTdiRE9NYmdWaFROMEZANS1dId2gyYXU3NXZACTzFmaTd3Q0pySFRUeG1tSGg1c29sY2VtNWNRQlpXeWNyWVpJT0RhbXhFWE9JeDNDUm5DMkJtWEo0OTRQQjlLcWV3TXJGRHVPcEctclJXYmZAzQTJnUQZDZD"!,
            recipient_id: props.lead_id,
          });
          await new Promise((resolve) => setTimeout(resolve, 300));
          await sendMetaTyping({
            page_token:
              "IGAAnIjPX8ZAZClBZAGItZATM5RTdiRE9NYmdWaFROMEZANS1dId2gyYXU3NXZACTzFmaTd3Q0pySFRUeG1tSGg1c29sY2VtNWNRQlpXeWNyWVpJT0RhbXhFWE9JeDNDUm5DMkJtWEo0OTRQQjlLcWV3TXJGRHVPcEctclJXYmZAzQTJnUQZDZD",
            recipient_id: props.lead_id,
            delay: Number(message.interval || 0),
          });
        }
      } catch (error: any) {
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
          keyControl: props.keyControl,
        });
        let msgkey: string | null = null;
        if (props.external_adapter.type === "baileys") {
          const msg = await SendMessageText({
            connectionId: props.connectionId,
            toNumber: props.lead_id,
            text: nextText,
            mode: "prod",
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

        if (msgkey && props.nodeId) {
          await NodeAddVariables({
            data: {
              list: message.varId ? [{ id: message.varId, value: msgkey }] : [],
              list_temp: message.save_locale_var_name
                ? [
                    {
                      name: message.save_locale_var_name,
                      key: "1",
                      value: msgkey,
                    },
                  ]
                : [],
            },
            keyControl: props.keyControl,
            contactAccountId: props.contactAccountId,
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
    return res({ varTemps: [] });
  });
};

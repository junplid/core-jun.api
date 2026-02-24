import { NodeNotifyWAData } from "../Payload";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveJid } from "../../../utils/resolveJid";
import { NodeMessage } from "./Message";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

type PropsNodeNotifyWA =
  | {
      lead_id: string;
      contactAccountId: number;
      connectionId: number;
      external_adapter:
        | { type: "baileys" }
        | { type: "instagram"; page_token: string };

      data: NodeNotifyWAData;
      accountId: number;
      businessName: string;
      ticketProtocol?: string;
      nodeId: string;
      flowStateId: number;
      action: { onErrorClient?(): void };
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      data: NodeNotifyWAData;
      nodeId: string;
      lead_id: string;
      contactAccountId: number;
      accountId: number;
    };

export const NodeNotifyWA = async (props: PropsNodeNotifyWA): Promise<void> => {
  for await (const { number } of props.data.numbers) {
    const newNumber = validatePhoneNumber(number);

    if (newNumber) {
      if (props.mode === "prod") {
        const valid = await resolveJid(props.connectionId, newNumber, true);
        if (!valid) continue;
        if (props.data.tagIds?.length) {
          let contactsWAOnAccountId: number | null = null;
          const contactAccount = await prisma.contactsWAOnAccount.findFirst({
            where: { accountId: props.accountId, contactWAId: valid.contactId },
            select: { id: true },
          });
          if (!contactAccount?.id) {
            const { id } = await prisma.contactsWAOnAccount.create({
              data: {
                name: "<unknown>",
                accountId: props.accountId,
                contactWAId: valid.contactId,
              },
              select: { id: true },
            });
            contactsWAOnAccountId = id;
          } else {
            contactsWAOnAccountId = contactAccount.id;
          }
          for await (const tagId of props.data.tagIds) {
            const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
              where: { contactsWAOnAccountId: contactsWAOnAccountId, tagId },
            });
            if (!isExist) {
              await prisma.tagOnContactsWAOnAccount.create({
                data: { contactsWAOnAccountId: contactsWAOnAccountId, tagId },
              });
            }
          }
        }
      } else {
        for await (const tagId of props.data.tagIds) {
          const isExist = await prisma.tag.findFirst({
            where: { id: tagId },
            select: { name: true },
          });
          if (isExist) {
            await SendMessageText({
              mode: "testing",
              accountId: props.accountId,
              role: "system",
              text: `Tag: ${isExist?.name} adicionada a ${newNumber}`,
              token_modal_chat_template: props.token_modal_chat_template,
            });
            new Promise((s) => setTimeout(s, 300));
          }
        }
      }

      try {
        if (props.mode === "prod") {
          await NodeMessage({
            accountId: props.accountId,
            action: props.action,
            connectionId: props.connectionId,
            sendBy: "bot",
            contactAccountId: props.contactAccountId,
            data: {
              messages: [
                {
                  key: "1",
                  text: props.data.text || "",
                  interval: undefined,
                },
              ],
            },
            external_adapter: props.external_adapter,
            flowStateId: props.flowStateId,
            lead_id: props.lead_id,
            nodeId: props.nodeId,
            mode: "prod",
          });
        } else {
          await NodeMessage({
            accountId: props.accountId,
            sendBy: "bot",
            contactAccountId: props.contactAccountId,
            data: {
              messages: [
                {
                  key: "1",
                  text: props.data.text || "",
                  interval: undefined,
                },
              ],
            },
            token_modal_chat_template: props.token_modal_chat_template,
            lead_id: props.lead_id,
            nodeId: props.nodeId,
            mode: "testing",
          });
        }
        continue;
      } catch (error) {
        continue;
      }
    }
  }
};

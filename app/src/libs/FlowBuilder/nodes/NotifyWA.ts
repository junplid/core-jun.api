import { WASocket } from "baileys";
import { NodeNotifyWAData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveJid } from "../../../utils/resolveJid";

interface PropsNodeNotifyWA {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeNotifyWAData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
  flowStateId: number;
}

export const NodeNotifyWA = async (props: PropsNodeNotifyWA): Promise<void> => {
  const nextText = await resolveTextVariables({
    accountId: props.accountId,
    contactsWAOnAccountId: props.contactsWAOnAccountId,
    text: props.data.text || "",
    ticketProtocol: props.ticketProtocol,
    numberLead: props.numberLead,
    nodeId: props.nodeId,
  });

  for await (const { number } of props.data.numbers) {
    const newNumber = validatePhoneNumber(number);
    let contactsWAOnAccountId: number | null = null;

    if (newNumber) {
      const valid = await resolveJid(props.botWA, newNumber, true);
      if (!valid.jid) continue;

      if (valid.contactId) {
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
      }

      if (!contactsWAOnAccountId) continue;
      for await (const tagId of props.data.tagIds || []) {
        const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
          where: { contactsWAOnAccountId: contactsWAOnAccountId, tagId },
        });
        if (!isExist) {
          await prisma.tagOnContactsWAOnAccount.create({
            data: { contactsWAOnAccountId: contactsWAOnAccountId, tagId },
          });
        }
      }

      try {
        const msg = await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: nextText,
          toNumber: valid.jid,
        });
        if (!msg) continue;
        await prisma.messages.create({
          data: {
            by: "bot",
            message: nextText,
            type: "text",
            messageKey: msg.key.id,
            flowStateId: props.flowStateId,
          },
        });
        continue;
      } catch (error) {
        continue;
      }
    }
  }
};

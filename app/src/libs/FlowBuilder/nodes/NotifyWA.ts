import { WASocket } from "baileys";
import { NodeNotifyWAData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { prisma } from "../../../adapters/Prisma/client";

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
    const newNumber = validatePhoneNumber(number, { removeNine: true });
    if (newNumber) {
      const { ContactsWAOnAccount, ...contactWA } =
        await prisma.contactsWA.upsert({
          where: { completeNumber: newNumber },
          create: { completeNumber: newNumber },
          update: {},
          select: {
            id: true,
            ContactsWAOnAccount: {
              where: { accountId: props.accountId },
              select: { id: true },
            },
          },
        });

      if (!ContactsWAOnAccount.length) {
        const { id: newContact } = await prisma.contactsWAOnAccount.create({
          data: {
            name: "<unknown>",
            accountId: props.accountId,
            contactWAId: contactWA.id,
          },
          select: { id: true },
        });
        ContactsWAOnAccount.push({ id: newContact });
      }

      for await (const tagId of props.data.tagIds || []) {
        const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
          where: { contactsWAOnAccountId: ContactsWAOnAccount[0].id, tagId },
        });
        if (!isExist) {
          await prisma.tagOnContactsWAOnAccount.create({
            data: { contactsWAOnAccountId: ContactsWAOnAccount[0].id, tagId },
          });
        }
      }

      try {
        const msg = await SendMessageText({
          connectionId: props.connectionWhatsId,
          text: nextText,
          toNumber: newNumber + "@s.whatsapp.net",
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

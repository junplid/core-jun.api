import { NodeNotifyWAData } from "../Payload";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveJid } from "../../../utils/resolveJid";
import { NodeMessage } from "./Message";

interface PropsNodeNotifyWA {
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
}

export const NodeNotifyWA = async (props: PropsNodeNotifyWA): Promise<void> => {
  for await (const { number } of props.data.numbers) {
    const newNumber = validatePhoneNumber(number);

    if (newNumber) {
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

      try {
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
        });
        continue;
      } catch (error) {
        continue;
      }
    }
  }
};

import { WASocket } from "baileys";
import { NodeNotifyWAData } from "../Payload";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
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
  console.log("NodeNotifyWA", props);
  const nextText = await resolveTextVariables({
    accountId: props.accountId,
    contactsWAOnAccountId: props.contactsWAOnAccountId,
    text: props.data.text,
    ticketProtocol: props.ticketProtocol,
    numberLead: props.numberLead,
    nodeId: props.nodeId,
  });

  for await (const { number } of props.data.numbers) {
    const newNumber = validatePhoneNumber(number, { removeNine: true });
    if (newNumber) {
      try {
        await TypingDelay({
          delay: 4,
          toNumber: newNumber + "@s.whatsapp.net",
          connectionId: props.connectionWhatsId,
        });

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

import { prisma } from "../../../adapters/Prisma/client";
import { NodeWebhookTrelloCardData } from "../Payload";

interface PropsNodeAction {
  data: NodeWebhookTrelloCardData;
  accountId: number;
  beforeName: string;
  afterName: string;
  cardId: string;
  contactsWAOnAccountId: number;
}

export const NodeWebhookTrelloCard = async (
  props: PropsNodeAction
): Promise<"return" | "next"> => {
  const { data, contactsWAOnAccountId, accountId, ...rest } = props;

  const cardId = await prisma.contactsWAOnAccountVariable.findFirst({
    where: { contactsWAOnAccountId, variableId: data.varId_cardId },
    select: { value: true },
  });
  if (!cardId?.value || cardId.value !== rest.cardId) return "return";

  try {
    if (data.varId_save_listAfterId) {
      const exist = await prisma.variable.findFirst({
        where: { id: data.varId_save_listAfterId, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId,
            variableId: data.varId_save_listAfterId,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId,
              variableId: data.varId_save_listAfterId,
              value: props.afterName,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId,
              variableId: data.varId_save_listAfterId,
              value: props.afterName,
            },
          });
        }
      }
    }
    if (data.varId_save_listBeforeId) {
      const exist = await prisma.variable.findFirst({
        where: { id: data.varId_save_listBeforeId, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId,
            variableId: data.varId_save_listBeforeId,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId,
              variableId: data.varId_save_listBeforeId,
              value: props.beforeName,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId,
              variableId: data.varId_save_listBeforeId,
              value: props.beforeName,
            },
          });
        }
      }
    }
    return "next";
  } catch (error) {
    return "next";
  }
};

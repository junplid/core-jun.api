import { prisma } from "../../../adapters/Prisma/client";
import { NodeListenReactionData } from "../Payload";

interface PropsNodeListenReaction {
  data: NodeListenReactionData;
  message: string;
  reactionText: string;
  contactsWAOnAccountId: number;
  contactsWAOnAccountReactionId?: number;
}

export const NodeListenReaction = async (
  props: PropsNodeListenReaction
): Promise<void> => {
  if (props.data.varIdToReaction) {
    const exist = await prisma.variable.findFirst({
      where: { id: props.data.varIdToReaction, type: "dynamics" },
      select: { id: true },
    });
    if (exist) {
      const picked = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varIdToReaction,
        },
        select: { id: true },
      });
      if (!picked) {
        await prisma.contactsWAOnAccountVariable.create({
          data: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.varIdToReaction,
            value: props.reactionText,
          },
        });
      } else {
        await prisma.contactsWAOnAccountVariable.update({
          where: { id: picked.id },
          data: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.varIdToReaction,
            value: props.reactionText,
          },
        });
      }
      if (props.contactsWAOnAccountReactionId) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountReactionId,
            variableId: props.data.varIdToReaction,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountReactionId,
              variableId: props.data.varIdToReaction,
              value: props.reactionText,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountReactionId,
              variableId: props.data.varIdToReaction,
              value: props.reactionText,
            },
          });
        }
      }
    }
  }
  if (props.data.varIdToMessage) {
    const exist = await prisma.variable.findFirst({
      where: { id: props.data.varIdToMessage, type: "dynamics" },
      select: { id: true },
    });
    if (exist) {
      const picked = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varIdToMessage,
        },
        select: { id: true },
      });
      if (!picked) {
        await prisma.contactsWAOnAccountVariable.create({
          data: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.varIdToMessage,
            value: props.message,
          },
        });
      } else {
        await prisma.contactsWAOnAccountVariable.update({
          where: { id: picked.id },
          data: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.varIdToMessage,
            value: props.message,
          },
        });
      }
      if (props.contactsWAOnAccountReactionId) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountReactionId,
            variableId: props.data.varIdToMessage,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountReactionId,
              variableId: props.data.varIdToMessage,
              value: props.message,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountReactionId,
              variableId: props.data.varIdToMessage,
              value: props.message,
            },
          });
        }
      }
    }
  }
  return;
};

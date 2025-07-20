import { prisma } from "../../../adapters/Prisma/client";
import { Trello } from "../../../adapters/Trello";
import { NodeAddTrelloCardData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeAction {
  data: NodeAddTrelloCardData;
  contactsWAOnAccountId: number;
  nodeId: string;
  accountId: number;
  numberLead: string;
  flowStateId: number;
}

export const NodeAddTrelloCard = async (
  props: PropsNodeAction
): Promise<void> => {
  const { data, contactsWAOnAccountId } = props;

  const getIntegration = await prisma.trelloIntegration.findFirst({
    where: { id: data.trelloIntegrationId, accountId: props.accountId },
    select: { token: true, key: true },
  });

  if (getIntegration) {
    const trello = new Trello(getIntegration.key, getIntegration.token);

    try {
      data.name = await resolveTextVariables({
        accountId: props.accountId,
        text: data.name,
        nodeId: props.nodeId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
      });

      if (data.desc) {
        data.desc = await resolveTextVariables({
          accountId: props.accountId,
          text: data.desc,
          nodeId: props.nodeId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          numberLead: props.numberLead,
        });
      }

      const { id } = await trello.adicionarCard(data.listId, {
        pos: "bottom",
        name: data.name,
        desc: data.desc,
      });

      if (data.varId_save_cardId) {
        const exist = await prisma.variable.findFirst({
          where: { id: data.varId_save_cardId, type: "dynamics" },
          select: { id: true },
        });

        if (exist) {
          const picked = await prisma.contactsWAOnAccountVariable.findFirst({
            where: {
              contactsWAOnAccountId,
              variableId: data.varId_save_cardId,
            },
            select: { id: true },
          });
          if (!picked) {
            await prisma.contactsWAOnAccountVariable.create({
              data: {
                contactsWAOnAccountId,
                variableId: data.varId_save_cardId,
                value: id,
              },
            });
          } else {
            await prisma.contactsWAOnAccountVariable.update({
              where: { id: picked.id },
              data: {
                contactsWAOnAccountId,
                variableId: data.varId_save_cardId,
                value: id,
              },
            });
          }
        }
      }

      // adicionar webhook
      const callback = `https://api.junplid.com.br/v1/public/webhook/trello?flowStateId=${props.flowStateId}&nodeId=${props.nodeId}&ac=${props.accountId}`;
      // const callback = `https://fb339e8b3eec.ngrok-free.app/v1/public/webhook/trello?flowStateId=${props.flowStateId}&nodeId=${props.nodeId}&ac=${props.accountId}`;
      await trello.criarWebhook(
        `Webhook-card Junplid p/ node:${props.nodeId}`,
        callback,
        id
      );
    } catch (error) {
      console.log("error", error);
      return;
    }
  }
};

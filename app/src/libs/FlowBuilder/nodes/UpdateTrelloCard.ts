import { prisma } from "../../../adapters/Prisma/client";
import { Trello } from "../../../adapters/Trello";
import { NodeUpdateTrelloCardData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeAction {
  data: NodeUpdateTrelloCardData;
  contactsWAOnAccountId: number;
  nodeId: string;
  accountId: number;
  numberLead: string;
}

export const NodeUpdateTrelloCard = async (
  props: PropsNodeAction
): Promise<void> => {
  const { data, contactsWAOnAccountId } = props;
  const cardId = await prisma.contactsWAOnAccountVariable.findFirst({
    where: { contactsWAOnAccountId, variableId: data.varId_cardId },
    select: { value: true },
  });

  if (!cardId?.value) return;

  const getIntegration = await prisma.trelloIntegration.findFirst({
    where: { id: data.trelloIntegrationId, accountId: props.accountId },
    select: { token: true, key: true },
  });

  if (getIntegration) {
    const trello = new Trello(getIntegration.key, getIntegration.token);

    const objData = {};

    try {
      if (data.fields?.includes("name")) {
        Object.assign(objData, {
          name: await resolveTextVariables({
            accountId: props.accountId,
            text: data.name || "",
            nodeId: props.nodeId,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            numberLead: props.numberLead,
          }),
        });
      }

      if (data.fields?.includes("desc")) {
        Object.assign(objData, {
          desc: await resolveTextVariables({
            accountId: props.accountId,
            text: data.desc || "",
            nodeId: props.nodeId,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            numberLead: props.numberLead,
          }),
        });
      }

      await trello.editarCard(cardId.value, objData);
    } catch (error) {
      return;
    }
  }
};

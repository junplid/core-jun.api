import { prisma } from "../../../adapters/Prisma/client";
import { Trello } from "../../../adapters/Trello";
import { NodeRemoveTrelloCardData } from "../Payload";

interface PropsNodeAction {
  data: NodeRemoveTrelloCardData;
  contactsWAOnAccountId: number;
  accountId: number;
}

export const NodeRemoveTrelloCard = async (
  props: PropsNodeAction
): Promise<void> => {
  const { data, contactsWAOnAccountId } = props;
  if (!data.varId_cardId) return;

  const getIntegration = await prisma.trelloIntegration.findFirst({
    where: { id: data.trelloIntegrationId, accountId: props.accountId },
    select: { token: true, key: true },
  });

  if (getIntegration) {
    const trello = new Trello(getIntegration.key, getIntegration.token);

    try {
      const cardId = await prisma.contactsWAOnAccountVariable.findFirst({
        where: { contactsWAOnAccountId, variableId: data.varId_cardId },
        select: { value: true },
      });

      if (!cardId?.value) return;

      await trello.removerCard(cardId.value);
    } catch (error) {
      return;
    }
  }
};

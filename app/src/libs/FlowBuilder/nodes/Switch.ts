import { prisma } from "../../../adapters/Prisma/client";
import { NodeSwitchVariableData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeSwitchVariable {
  data: NodeSwitchVariableData;
  contactsWAOnAccountId: number;
  accountId: number;
  numberLead: string;
}

type ResultPromise = { handleId?: string };

export const NodeSwitchVariable = async (
  props: PropsNodeSwitchVariable
): Promise<ResultPromise> => {
  const { data, contactsWAOnAccountId } = props;

  for await (const { v, key } of data.values) {
    const nextV = await resolveTextVariables({
      accountId: props.accountId,
      text: v,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
    });
    const is = await prisma.variable.findFirst({
      where: {
        id: data.id,
        ContactsWAOnAccountVariable: {
          some: { contactsWAOnAccountId, value: nextV },
        },
      },
      select: { id: true },
    });
    if (is) return { handleId: key };
  }

  return { handleId: undefined };
};

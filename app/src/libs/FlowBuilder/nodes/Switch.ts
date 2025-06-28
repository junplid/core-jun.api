import { prisma } from "../../../adapters/Prisma/client";
import { NodeSwitchVariableData } from "../Payload";

interface PropsNodeSwitchVariable {
  data: NodeSwitchVariableData;
  contactsWAOnAccountId: number;
}

type ResultPromise = { handleId?: string };

export const NodeSwitchVariable = async (
  props: PropsNodeSwitchVariable
): Promise<ResultPromise> => {
  const { data, contactsWAOnAccountId } = props;

  for await (const { v, key } of data.values) {
    const is = await prisma.variable.findFirst({
      where: {
        id: data.id,
        ContactsWAOnAccountVariable: {
          some: { contactsWAOnAccountId, value: v },
        },
      },
      select: { id: true },
    });
    if (is) return { handleId: key };
  }

  return { handleId: undefined };
};

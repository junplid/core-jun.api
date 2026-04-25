import { prisma } from "../../../adapters/Prisma/client";
import { NodeSwitchVariableData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeSwitchVariable {
  data: NodeSwitchVariableData;
  contactsWAOnAccountId: number;
  accountId: number;
  numberLead: string;
  keyControl: string;
}

type ResultPromise = { handleId?: string };

export const NodeSwitchVariable = async (
  props: PropsNodeSwitchVariable,
): Promise<ResultPromise> => {
  const { data } = props;

  const get = await prisma.variable.findFirst({
    where: { id: data.id },
    select: {
      name: true,
    },
  });

  if (!get) return { handleId: undefined };

  const valueVar = await resolveTextVariables({
    accountId: props.accountId,
    text: `{{${get.name}}}`,
    contactsWAOnAccountId: props.contactsWAOnAccountId,
    numberLead: props.numberLead,
    keyControl: props.keyControl,
  });

  for await (const { v, key } of data.values) {
    const nextV = await resolveTextVariables({
      accountId: props.accountId,
      text: v,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      keyControl: props.keyControl,
    });

    if (valueVar === nextV) return { handleId: key };
  }

  return { handleId: undefined };
};

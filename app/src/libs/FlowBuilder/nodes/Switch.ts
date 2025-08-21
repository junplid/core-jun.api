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
  const { data } = props;

  let valueVar = "";
  const get = await prisma.variable.findFirst({
    where: { id: data.id },
    select: {
      type: true,
      id: true,
      value: true,
      name: true,
      ContactsWAOnAccountVariable: { select: { value: true } },
    },
  });

  if (!get) return { handleId: undefined };
  if (get.type === "system") {
    valueVar = await resolveTextVariables({
      accountId: props.accountId,
      text: `{{${get.name}}}`,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
    });
  } else {
    valueVar = get.value || get.ContactsWAOnAccountVariable?.[0].value || "";
  }

  for await (const { v, key } of data.values) {
    const nextV = await resolveTextVariables({
      accountId: props.accountId,
      text: v,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
    });

    if (valueVar === nextV) return { handleId: key };
  }

  return { handleId: undefined };
};

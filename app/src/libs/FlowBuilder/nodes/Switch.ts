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

  if (!data.id && !data.locale_var_name) {
    return { handleId: undefined };
  }

  let nameVar = "";

  if (data.id) {
    const get = await prisma.variable.findFirst({
      where: { id: data.id },
      select: { name: true },
    });
    if (!get) return { handleId: undefined };
    nameVar = get.name;
  }

  if (data.locale_var_name) {
    nameVar = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: data.locale_var_name || "",
      numberLead: props.numberLead,
      keyControl: props.keyControl,
    });
  }

  const valueVar = await resolveTextVariables({
    accountId: props.accountId,
    text: `{{${nameVar}}}`,
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

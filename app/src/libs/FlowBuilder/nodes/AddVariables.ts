import { prisma } from "../../../adapters/Prisma/client";
import { NodeAddVariablesData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeAction {
  data: NodeAddVariablesData;
  contactAccountId: number;
  nodeId: string;
  accountId: number;
  numberLead: string;
}

export const NodeAddVariables = (props: PropsNodeAction): Promise<void> =>
  new Promise(async (res, _rej) => {
    const { data, contactAccountId } = props;

    for await (const newVar of data.list || []) {
      const exist = await prisma.variable.findFirst({
        where: { id: newVar.id, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const nextValue = await resolveTextVariables({
          accountId: props.accountId,
          text: newVar.value || "",
          nodeId: props.nodeId,
          contactsWAOnAccountId: contactAccountId,
          numberLead: props.numberLead,
        });
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: contactAccountId,
            variableId: newVar.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: contactAccountId,
              variableId: newVar.id,
              value: nextValue,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: contactAccountId,
              variableId: newVar.id,
              value: nextValue,
            },
          });
        }
      }
    }

    return res();
  });

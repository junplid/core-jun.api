import { prisma } from "../../../adapters/Prisma/client";
import { NodeRemoveVariablesData } from "../Payload";

interface PropsRemoveAction {
  data: NodeRemoveVariablesData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  nodeId: string;
}

export const NodeRemoveVariables = (props: PropsRemoveAction): Promise<void> =>
  new Promise(async (res, _rej) => {
    const { data, contactsWAOnAccountId } = props;

    for await (const id of data.list || []) {
      const exist = await prisma.variable.findFirst({
        where: { id, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: { contactsWAOnAccountId, variableId: id },
          select: { id: true },
        });
        if (picked) {
          await prisma.contactsWAOnAccountVariable.delete({
            where: { id: picked.id },
          });
        }
      }
    }

    return res();
  });

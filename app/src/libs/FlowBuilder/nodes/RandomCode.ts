import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { NodeRandomCodeData } from "../Payload";

interface PropsNodeRandomCode {
  data: NodeRandomCodeData;
  contactsWAOnAccountId: number;
}

export const NodeRandomCode = (props: PropsNodeRandomCode): Promise<void> =>
  new Promise(async (res, _rej) => {
    const { data, contactsWAOnAccountId } = props;

    const exist = await prisma.variable.findFirst({
      where: { id: data.id, type: "dynamics" },
      select: { id: true },
    });

    if (exist) {
      const code = genNumCode(data.count || 5);
      const picked = await prisma.contactsWAOnAccountVariable.findFirst({
        where: { contactsWAOnAccountId, variableId: data.id },
        select: { id: true },
      });
      if (!picked) {
        await prisma.contactsWAOnAccountVariable.create({
          data: { contactsWAOnAccountId, variableId: data.id, value: code },
        });
      } else {
        await prisma.contactsWAOnAccountVariable.update({
          where: { id: picked.id },
          data: { contactsWAOnAccountId, variableId: data.id, value: code },
        });
      }
    }

    return res();
  });

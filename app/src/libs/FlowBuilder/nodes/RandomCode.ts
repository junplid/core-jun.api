import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { NodeRandomCodeData } from "../Payload";
import { localVariables } from "../utils/LocalVariables";

interface PropsNodeRandomCode {
  data: NodeRandomCodeData;
  contactsWAOnAccountId: number;
  keyControl: string;
}

export const NodeRandomCode = (props: PropsNodeRandomCode): Promise<void> =>
  new Promise(async (res, _rej) => {
    const { data, contactsWAOnAccountId } = props;
    const code = genNumCode(data.count || 5);

    if (data.id) {
      const exist = await prisma.variable.findFirst({
        where: { id: data.id, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
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
    }
    if (data.save_locale_var_name) {
      localVariables.upsert(props.keyControl, [
        data.save_locale_var_name,
        code,
      ]);
    }

    return res();
  });

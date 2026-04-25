import { evaluate } from "mathjs";
import { NodeCalculatorData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { localVariables } from "../utils/LocalVariables";

interface PropsNodeCalculator {
  data: NodeCalculatorData;
  contactsWAOnAccountId: number;
  accountId: number;
  nodeId: string;
  keyControl: string;
}

export const NodeCalculator = async (
  props: PropsNodeCalculator,
): Promise<void> => {
  try {
    const formula = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: props.data.formula || "",
      keyControl: props.keyControl,
    });
    const value = evaluate(formula);
    const exist = await prisma.variable.findFirst({
      where: { id: props.contactsWAOnAccountId, type: "dynamics" },
      select: { id: true },
    });

    if (props.data.variableId && exist) {
      const picked = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.variableId,
        },
        select: { id: true },
      });
      if (!picked) {
        await prisma.contactsWAOnAccountVariable.create({
          data: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.variableId,
            value: String(value),
          },
        });
      } else {
        await prisma.contactsWAOnAccountVariable.update({
          where: { id: picked.id },
          data: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: props.data.variableId,
            value: String(value),
          },
        });
      }
    }

    if (props.data.save_locale_var_name) {
      localVariables.upsert(props.keyControl, [
        props.data.save_locale_var_name,
        String(value),
      ]);
    }
  } catch (error) {
    return;
  }
};

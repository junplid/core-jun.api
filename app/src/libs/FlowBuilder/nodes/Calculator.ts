import { evaluate } from "mathjs";
import { NodeCalculatorData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsNodeCalculator {
  data: NodeCalculatorData;
  contactsWAOnAccountId: number;
  accountId: number;
  nodeId: string;
}

export const NodeCalculator = async (
  props: PropsNodeCalculator
): Promise<void> => {
  try {
    const formula = await resolveTextVariables({
      accountId: props.accountId,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      text: props.data.formula || "",
    });
    const value = evaluate(formula);
    const exist = await prisma.variable.findFirst({
      where: { id: props.contactsWAOnAccountId, type: "dynamics" },
      select: { id: true },
    });

    if (exist) {
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
  } catch (error) {
    return;
  }
};

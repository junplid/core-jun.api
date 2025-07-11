import { NodeGetOrdersData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

interface PropsUpdateOrder {
  numberLead: string;
  contactsWAOnAccountId: number;
  data: NodeGetOrdersData;
  accountId: number;
  nodeId: string;
}

export const NodeUpdateOrder = async (
  props: PropsUpdateOrder
): Promise<void> => {
  try {
    const {
      varId_save,
      filter,
      count,
      daysAgo,
      model_save,
      ofContact,
      ...restData
    } = props.data;

    const getOrders = await prisma.orders.findMany({
      where: {
        accountId: props.accountId,
        ...(ofContact && {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
        }),
        ...restData,
      },
      select: {
        n_order: true,
        data: true,
        name: true,
        total: true,
        priority: true,
        origin: true,
        status: true,
      },
    });

    if (count) {
      if (varId_save) {
        const exist = await prisma.variable.findFirst({
          where: { id: varId_save, type: "dynamics" },
          select: { id: true },
        });

        if (exist) {
          const picked = await prisma.contactsWAOnAccountVariable.findFirst({
            where: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save,
            },
            select: { id: true },
          });
          if (!picked) {
            await prisma.contactsWAOnAccountVariable.create({
              data: {
                contactsWAOnAccountId: props.contactsWAOnAccountId,
                variableId: varId_save,
                value: String(getOrders.length),
              },
            });
          } else {
            await prisma.contactsWAOnAccountVariable.update({
              where: { id: picked.id },
              data: {
                contactsWAOnAccountId: props.contactsWAOnAccountId,
                variableId: varId_save,
                value: String(getOrders.length),
              },
            });
          }
        }
      }
      return;
    }

    let textVar = "";
    const hasVar = !!model_save?.match(/{{\w+}}/g);

    for (const order of getOrders) {
      if (model_save) {
        if (hasVar) {
          const options = Object.entries(order).map((s) => {
            return {
              name: `VMODEL_${s[0].toUpperCase()}`,
              value: s[1] ? String(s[1]) : null,
            };
          });
          textVar += resolveTextVariables(
            {
              accountId: props.accountId,
              text: model_save,
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              nodeId: props.nodeId,
              numberLead: props.numberLead,
            },
            options
          );
        } else {
          textVar += model_save;
        }
      } else {
        textVar += `CODE=${order.n_order}\nSTATUS${order.status}`;
      }
      textVar += "\n--------\n";
    }

    if (varId_save) {
      const exist = await prisma.variable.findFirst({
        where: { id: varId_save, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: varId_save,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save,
              value: textVar,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save,
              value: textVar,
            },
          });
        }
      }
    }

    return;
  } catch (error) {
    return;
  }
};

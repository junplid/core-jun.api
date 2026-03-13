import { NodeGetOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";

type PropsGetOrder =
  | {
      numberLead: string;
      contactsWAOnAccountId: number;
      data: NodeGetOrderData;
      accountId: number;
      businessName: string;
      nodeId: string;
      flowStateId: number;
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
    };

export const NodeGetOrder = async (
  props: PropsGetOrder,
): Promise<"not_found" | "ok"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou buscar pedido, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return "ok";
  }

  try {
    const { nOrder, fields, ...restData } = props.data;

    const resolvercode = await resolveTextVariables({
      accountId: props.accountId,
      text: nOrder,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    const getorder = await prisma.orders.findFirst({
      where: { n_order: resolvercode },
      select: {
        name: true,
        data: true,
        payment_method: true,
        total: true,
        delivery_address: true,
        status: true,
        ContactsWAOnAccount: {
          select: { ContactsWA: { select: { realNumber: true } } },
        },
      },
    });

    if (!getorder) return "not_found";

    if (restData.varId_save_name) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_name, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.name || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.name || "<empty>",
            },
          });
        }
      }
    }
    if (restData.varId_save_status) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_status, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.status || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.status || "<empty>",
            },
          });
        }
      }
    }
    if (restData.varId_save_payment_method) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_payment_method, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.payment_method || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.payment_method || "<empty>",
            },
          });
        }
      }
    }
    if (restData.varId_save_delivery_address) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_delivery_address, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.delivery_address || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.delivery_address || "<empty>",
            },
          });
        }
      }
    }
    if (restData.varId_save_total) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_total, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.total
                ? String(getorder.total.toNumber())
                : "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.total
                ? String(getorder.total.toNumber())
                : "<empty>",
            },
          });
        }
      }
    }
    if (restData.varId_save_data) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_data, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.data || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.data || "<empty>",
            },
          });
        }
      }
    }
    if (restData.varId_save_number_contact) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_number_contact, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value:
                getorder.ContactsWAOnAccount?.ContactsWA.realNumber ||
                "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value:
                getorder.ContactsWAOnAccount?.ContactsWA.realNumber ||
                "<empty>",
            },
          });
        }
      }
    }

    return "ok";
  } catch (error) {
    return "not_found";
  }
};

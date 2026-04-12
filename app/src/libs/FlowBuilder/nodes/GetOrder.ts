import { NodeGetOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { Decimal } from "@prisma/client/runtime/library";
import { formatToBRL } from "brazilian-values";

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

interface ItemDraft {
  title: string;
  price: Decimal | null;
  obs: string | null;
  side_dishes: string | null;
}

function formatOrder(itemsDraft: ItemDraft[]) {
  const itemsText = itemsDraft
    .map((item) => {
      let header = `*${item.title}*`;
      if ((item.price?.toNumber() || 0) > 0) {
        header += `  ${formatToBRL(item.price?.toNumber() || 0)}`;
      }

      const obs = item.obs ? `Obs: _${item.obs}_` : "";

      return [header, item.side_dishes, obs].filter(Boolean).join("\n");
    })
    .join("\n\n");

  return itemsText;
}

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
    const { nOrder_deliveryCode, fields, ...restData } = props.data;

    if (!fields?.length) return "ok";

    const resolvercode = await resolveTextVariables({
      accountId: props.accountId,
      text: nOrder_deliveryCode,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    const getorder = await prisma.orders.findFirst({
      where: {
        OR: [{ n_order: resolvercode }, { delivery_code: resolvercode }],
      },
      select: {
        name: true,
        data: true,
        n_order: true,
        payment_method: true,
        total: true,
        Router: { select: { Router: { select: { n_router: true } } } },
        delivery_code: true,
        delivery_address: true,
        status: true,
        ContactsWAOnAccount: {
          select: { ContactsWA: { select: { realNumber: true } } },
        },
        Items: {
          select: { obs: true, price: true, side_dishes: true, title: true },
        },
        OrderAdjustments: {
          take: 1,
          where: { type: "in", label: "Taxa de entrega" },
          select: { amount: true },
        },
      },
    });

    if (!getorder) return "not_found";

    if (fields.includes("type_code") && restData.varId_save_type_code) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_type_code, type: "dynamics" },
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
        const typecode =
          resolvercode === getorder.n_order ? "code_order" : "code_delivery";
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: typecode,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: typecode,
            },
          });
        }
      }
    }

    if (fields.includes("name") && restData.varId_save_name) {
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

    if (fields.includes("status") && restData.varId_save_status) {
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
    if (
      fields.includes("payment_method") &&
      restData.varId_save_payment_method
    ) {
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
    if (
      fields.includes("delivery_address") &&
      restData.varId_save_delivery_address
    ) {
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
    if (fields.includes("total") && restData.varId_save_total) {
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
    if (fields.includes("data") && restData.varId_save_data) {
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
    if (fields.includes("data_items") && restData.varId_save_data_items) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_data_items, type: "dynamics" },
        select: { id: true },
      });

      if (exist && getorder.Items.length) {
        const dataItems = formatOrder(getorder.Items);

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
              value: dataItems || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: dataItems || "",
            },
          });
        }
      }
    }
    if (fields.includes("delivery_fee") && restData.varId_save_delivery_fee) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_delivery_fee, type: "dynamics" },
        select: { id: true },
      });

      if (exist && getorder.OrderAdjustments.length) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        const value = getorder.OrderAdjustments[0].amount.toNumber().toFixed(2);
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: value || "",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: value || "",
            },
          });
        }
      }
    }
    if (
      fields.includes("number_contact") &&
      restData.varId_save_number_contact
    ) {
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

    if (fields.includes("router_code") && restData.varId_save_router_code) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_router_code, type: "dynamics" },
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
              value: getorder.Router?.Router.n_router || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.Router?.Router.n_router || "<empty>",
            },
          });
        }
      }
    }

    if (fields.includes("nOrder") && restData.varId_save_nOrder) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_nOrder, type: "dynamics" },
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
              value: getorder.n_order || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.n_order || "<empty>",
            },
          });
        }
      }
    }

    if (fields.includes("delivery_code") && restData.varId_save_delivery_code) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_delivery_code, type: "dynamics" },
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
              value: getorder.delivery_code || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getorder.delivery_code || "<empty>",
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

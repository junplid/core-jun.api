import { NodeAppendRouterData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import moment from "moment-timezone";
import { localVariables } from "../utils/LocalVariables";

type PropsAppendRouter =
  | {
      lead_id: string;
      contactAccountId: number;

      external_adapter:
        | { type: "baileys" }
        | { type: "instagram"; page_token: string };

      data: NodeAppendRouterData;
      accountId: number;
      nodeId: string;
      flowStateId: number;
      actions?: {
        onCodeRouter(code: string): void;
      };
      mode: "prod";
      keyControl: string;
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
      keyControl: string;
    };

export const NodeAppendRouter = async (
  props: PropsAppendRouter,
): Promise<"max" | "not_found" | undefined> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou adicionar pedido a rota, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return;
  }

  try {
    const existRouterOpen = await prisma.deliveryRouter.findFirst({
      where: { menuOnline: { accountId: props.accountId }, status: "open" },
      select: { id: true },
    });

    const n_order = await resolveTextVariables({
      accountId: props.accountId,
      text: props.data.nOrder,
      contactsWAOnAccountId: props.contactAccountId,
      numberLead: props.lead_id,
      nodeId: props.nodeId,
      keyControl: props.keyControl,
    });

    const order = await prisma.orders.findFirst({
      where: { n_order, Router: null },
      select: { id: true, menuId: true },
    });

    if (!order?.id || !order.menuId) {
      return "not_found";
    }
    let nRouter = "";
    let routerId;

    if (existRouterOpen) {
      const { Router } = await prisma.deliveryRouterOnOrders.create({
        data: { orderId: order.id, routerId: existRouterOpen.id },
        select: { Router: { select: { n_router: true, id: true } } },
      });
      nRouter = Router.n_router;
      routerId = Router.id;
    } else {
      const n_router = genNumCode(7);
      const timeoutAt = moment().add(props.data.minutes, "minutes").toDate();
      const { id } = await prisma.deliveryRouter.create({
        data: {
          flowStateId: props.flowStateId,
          nodeId: props.nodeId,
          n_router,
          timeoutAt,
          status: "open",
          menuId: order.menuId,
          DeliveryRouterOnOrders: { create: { orderId: order.id } },
        },
        select: { id: true },
      });
      nRouter = n_router;
      routerId = id;
    }

    const count = await prisma.deliveryRouterOnOrders.count({
      where: { Router: { n_router: nRouter } },
    });

    if (props.data.varId_save_nRouter) {
      const exist = await prisma.variable.findFirst({
        where: { id: props.data.varId_save_nRouter, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactAccountId,
              variableId: exist.id,
              value: nRouter,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactAccountId,
              variableId: exist.id,
              value: nRouter,
            },
          });
        }
      }
    }
    if (props.data.save_locale_var_name_nRouter) {
      localVariables.upsert(props.keyControl, [
        props.data.save_locale_var_name_nRouter,
        nRouter,
      ]);
    }

    let max = 6;
    if (props.data.max) {
      const mm = await resolveTextVariables({
        accountId: props.accountId,
        text: props.data.max,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
        keyControl: props.keyControl,
      });
      const qnt_max = Number(mm);
      if (!isNaN(qnt_max)) {
        max = qnt_max;
      }
    }

    if (count >= max) {
      prisma.deliveryRouter
        .update({
          where: { id: routerId },
          data: { isNotify: true },
        })
        .then(null)
        .catch(() => console.log("error"));
      return "max";
    }
    return;
  } catch (error) {
    return;
  }
};

import { NodePrintOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { webSocketEmitToRoom } from "../../../infra/websocket";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { formatToBRL } from "brazilian-values";
import { connectedDevices } from "../../../infra/websocket/cache";

type PropsPrintOrder =
  | {
      numberLead: string;
      contactsWAOnAccountId: number;
      accountId: number;
      nodeId: string;
      flowStateId: number;
      data: NodePrintOrderData;
      action?: string;

      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
    };

export const NodePrintOrder = async (
  props: PropsPrintOrder,
): Promise<string | undefined> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou imprimir ordem, mas funciona apenas em chat real",
      mode: "testing",
    });

    return "success";
  }

  try {
    if (props.action) {
      console.log(props.action);
      return props.action;
    }

    const resolvercode = await resolveTextVariables({
      accountId: props.accountId,
      text: props.data.nOrder,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    const getorder = await prisma.orders.findFirst({
      where: {
        n_order: resolvercode,
      },
      select: {
        total: true,
        sub_total: true,
        Items: {
          select: { obs: true, price: true, side_dishes: true, title: true },
        },
        name: true,
        n_order: true,
        menuOnline: {
          select: {
            deviceId_app_agent: true,
            titlePage: true,
            MenuInfo: { select: { delivery_fee: true } },
          },
        },
        OrderAdjustments: {
          where: { type: "in" },
          select: { amount: true, label: true },
        },
        payment_method: true,
        delivery_address: true,
      },
    });

    if (
      !getorder ||
      !getorder.menuOnline ||
      !getorder.menuOnline.MenuInfo ||
      !getorder.menuOnline.deviceId_app_agent
    ) {
      return "not_found";
    }

    const socket = connectedDevices.get(getorder.menuOnline.deviceId_app_agent);
    if (!socket) {
      return "not_found";
    }

    webSocketEmitToRoom()
      .account(props.accountId)
      .agent_app(getorder.menuOnline.deviceId_app_agent)
      .print(
        {
          menu_title: getorder.menuOnline.titlePage,
          n_order: getorder.n_order,
          ...(getorder.menuOnline.MenuInfo.delivery_fee?.toNumber() && {
            deliveryFee: formatToBRL(
              getorder.menuOnline.MenuInfo.delivery_fee.toNumber(),
            ),
          }),
          total: formatToBRL(getorder.total?.toNumber() || 0),
          subtotal: formatToBRL(getorder.sub_total?.toNumber() || 0),
          adjustments: getorder.OrderAdjustments.map((adj) => ({
            label: adj.label,
            amount: adj.amount.toNumber() || 0,
          })),
          items: getorder.Items.map((ii) => {
            return {
              title: ii.title,
              total: formatToBRL(ii.price?.toNumber() || 0),
              subs: ii.side_dishes,
              obs: ii.obs?.replace(/^\_(.*)\_$/, "$1"),
            };
          }),
        },
        [],
      );

    return;
  } catch (error) {
    console.log("", error);
    return;
  }
};

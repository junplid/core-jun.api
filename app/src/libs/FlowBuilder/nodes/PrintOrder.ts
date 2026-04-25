import { NodePrintOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { webSocketEmitToRoom } from "../../../infra/websocket";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { formatToBRL, parseToNumber } from "brazilian-values";
import { connectedDevices } from "../../../infra/websocket/cache";
import { remove } from "remove-accents";

type PropsPrintOrder =
  | {
      numberLead: string;
      contactsWAOnAccountId: number;
      accountId: number;
      nodeId: string;
      data: NodePrintOrderData;
      action?: string;
      keyControl: string;

      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
      keyControl: string;
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
      return props.action;
    }

    const resolvercode = await resolveTextVariables({
      accountId: props.accountId,
      text: props.data.nOrder,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
      keyControl: props.keyControl,
    });

    const getorder = await prisma.orders.findFirst({
      where: {
        n_order: resolvercode,
      },
      select: {
        id: true,
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
        delivery_cep: true,
        delivery_complement: true,
        delivery_number: true,
        delivery_reference_point: true,
        payment_change_to: true,
        Charges: {
          select: {
            status: true,
          },
        },
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
      prisma.pendingPrints
        .upsert({
          where: { orderId: getorder.id },
          create: { orderId: getorder.id },
          update: {},
        })
        .catch(() => {
          console.log("Não conseguiu salvar a pendencia de impressão.");
        })
        .then();
      return;
    }

    let charge_status = false;
    if (getorder.Charges.length) {
      if (
        getorder.Charges[0].status === "approved" ||
        getorder.Charges[0].status === "authorized"
      ) {
        charge_status = true;
      }
    }

    webSocketEmitToRoom()
      .account(props.accountId)
      .agent_app(getorder.menuOnline.deviceId_app_agent)
      .print(
        {
          notify: true,
          menu_title: remove(getorder.menuOnline.titlePage || ""),
          n_order: getorder.n_order,
          total: formatToBRL(getorder.total?.toNumber() || 0),
          subtotal: formatToBRL(getorder.sub_total?.toNumber() || 0),
          adjustments: getorder.OrderAdjustments.map((adj) => ({
            label: remove(adj.label),
            amount: formatToBRL(adj.amount.toNumber() || 0),
          })),
          payment_change_to: getorder.payment_change_to
            ? isNaN(parseToNumber(getorder.payment_change_to))
              ? null
              : parseToNumber(getorder.payment_change_to)
            : null,
          charge_status,
          name: remove(getorder.name || ""),
          payment_method: getorder.payment_method
            ? remove(getorder.payment_method)
            : null,
          type:
            getorder.delivery_address !== "RETIRAR" ? "delivery" : "retirada",
          ...(getorder.delivery_address !== "RETIRAR" && {
            delivery_address: getorder.delivery_address
              ? remove(getorder.delivery_address)
              : null,
            delivery_cep: getorder.delivery_cep
              ? remove(getorder.delivery_cep)
              : null,
            delivery_complement: getorder.delivery_complement
              ? remove(getorder.delivery_complement)
              : null,
            delivery_number: getorder.delivery_number
              ? remove(getorder.delivery_number)
              : null,
            delivery_reference_point: getorder.delivery_reference_point
              ? remove(getorder.delivery_reference_point)
              : null,
          }),

          items: getorder.Items.map((ii) => {
            return {
              title: remove(ii.title),
              total:
                (ii.price?.toNumber() || 0) > 0
                  ? formatToBRL(ii.price?.toNumber() || 0)
                  : undefined,
              subs: remove(ii.side_dishes || ""),
              obs: remove(ii.obs?.replace(/^\_(.*)\_$/, "$1") || ""),
            };
          }),
        },
        [],
      );

    return;
  } catch (error) {
    return;
  }
};

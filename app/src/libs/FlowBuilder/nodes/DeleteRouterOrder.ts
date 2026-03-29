import { NodeDeleteRouterOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

type PropsDeleteRouterOrder =
  | {
      data: NodeDeleteRouterOrderData;
      accountId: number;
      contactsWAOnAccountId: number;
      numberLead: string;
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
    };

export const NodeDeleteRouterOrder = async (
  props: PropsDeleteRouterOrder,
): Promise<"not_found" | "ok"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou deletar o pedido na rota, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return "ok";
  }

  try {
    const n_order = await resolveTextVariables({
      accountId: props.accountId,
      text: props.data.nOrder,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
    });

    const getOrder = await prisma.orders.findFirst({
      where: { n_order },
      select: { id: true, n_order: true, status: true },
    });

    if (!getOrder) return "not_found";

    await prisma.deliveryRouterOnOrders.delete({
      where: { id: getOrder.id },
    });
    return "ok";
  } catch (error) {
    console.log(error);
    return "not_found";
  }
};

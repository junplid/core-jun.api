import { NodeDeleteOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { webSocketEmitToRoom } from "../../../infra/websocket";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

type PropsDeleteOrder =
  | {
      data: NodeDeleteOrderData;
      accountId: number;
      contactsWAOnAccountId: number;
      numberLead: string;
      mode: "prod";
      keyControl: string;
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
      keyControl: string;
    };

export const NodeDeleteOrder = async (
  props: PropsDeleteOrder,
): Promise<"not_found" | "ok"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou atualizar pedido, mas só funciona apenas em chat real",
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
      keyControl: props.keyControl,
    });

    const getOrder = await prisma.orders.findFirst({
      where: { n_order },
      select: { id: true, n_order: true, status: true },
    });

    if (!getOrder) return "not_found";

    const { status } = await prisma.orders.update({
      where: { id: getOrder.id },
      data: { deleted: true, status: "cancelled" },
      select: { status: true },
    });

    webSocketEmitToRoom()
      .account(props.accountId)
      .orders.delete_order({ id: getOrder.id, status }, []);

    return "ok";
  } catch (error) {
    console.log(error);
    return "not_found";
  }
};

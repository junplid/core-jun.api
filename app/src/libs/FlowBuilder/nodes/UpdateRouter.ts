import { NodeUpdateRouterData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

type PropsUpdateRouter =
  | {
      numberLead: string;
      contactsWAOnAccountId: number;
      data: NodeUpdateRouterData;
      accountId: number;
      nodeId: string;
      flowStateId: number;
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
    };

export const NodeUpdateRouter = async (
  props: PropsUpdateRouter,
): Promise<"not_found" | "ok"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou atualizar a rota, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return "ok";
  }

  try {
    const { nRouter, fields, ...restData } = props.data;

    const n_router = await resolveTextVariables({
      accountId: props.accountId,
      text: nRouter,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      nodeId: props.nodeId,
      numberLead: props.numberLead,
    });

    const getRouter = await prisma.deliveryRouter.findFirst({
      where: { n_router },
      select: { id: true, n_router: true, status: true },
    });

    if (!getRouter) return "not_found";

    const nextData: any = {};

    // if (fields?.includes("qnt_max") && restData.max) {
    //   nextData.name = await resolveTextVariables({
    //     accountId: props.accountId,
    //     text: restData.max || "",
    //     contactsWAOnAccountId: props.contactsWAOnAccountId,
    //     numberLead: props.numberLead,
    //     nodeId: props.nodeId,
    //   });
    // }

    if (fields?.includes("status") && restData.status) {
      nextData.status = await resolveTextVariables({
        accountId: props.accountId,
        text: nextData.status,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        nodeId: props.nodeId,
        numberLead: props.numberLead,
      });
    }

    if (fields?.includes("add_order") && restData.nOrder) {
      restData.nOrder = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.nOrder,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        nodeId: props.nodeId,
        numberLead: props.numberLead,
      });
    }

    const getorder = await prisma.orders.findFirst({
      where: { n_order: restData.nOrder },
      select: { id: true },
    });

    prisma.deliveryRouter
      .update({
        where: { id: getRouter.id },
        data: {
          ...(fields?.includes("assign_to_contact") && {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
          }),
          ...nextData,
        },
      })
      .catch(undefined)
      .then(undefined);

    if (getorder?.id) {
      await prisma.deliveryRouterOnOrders.upsert({
        where: { orderId: getorder.id },
        create: { routerId: getRouter.id, orderId: getorder.id },
        update: { routerId: getRouter.id },
      });
    }

    return "ok";
  } catch (error) {
    console.log(error);
    return "not_found";
  }
};

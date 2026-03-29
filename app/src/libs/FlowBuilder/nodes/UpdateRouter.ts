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
      businessName: string;
      nodeId: string;
      flowStateId: number;
      mode: "prod";
      flowId: string;
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

    const n_order = await resolveTextVariables({
      accountId: props.accountId,
      text: nRouter,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      nodeId: props.nodeId,
      numberLead: props.numberLead,
    });
    const getOrder = await prisma.orders.findFirst({
      where: { n_order },
      select: { id: true, n_order: true, status: true },
    });

    if (!getOrder) return "not_found";

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
      nextData.status = restData.status;
    }

    await prisma.deliveryRouter.update({
      where: { id: getOrder.id },
      data: {
        ...(fields?.includes("assign_to_contact") && {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
        }),
        ...nextData,
      },
    });

    return "ok";
  } catch (error) {
    console.log(error);
    return "not_found";
  }
};

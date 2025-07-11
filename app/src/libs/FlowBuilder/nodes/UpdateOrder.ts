import { NodeUpdateOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { socketIo } from "../../../infra/express";

interface PropsUpdateOrder {
  numberLead: string;
  contactsWAOnAccountId: number;
  data: NodeUpdateOrderData;
  accountId: number;
  businessName: string;
  nodeId: string;
  flowStateId: number;
}

export const NodeUpdateOrder = async (
  props: PropsUpdateOrder
): Promise<"not_found" | "ok"> => {
  try {
    let chargeId: number | null = null;
    const { charge_transactionId, nOrder, fields, notify, ...restData } =
      props.data;

    if (charge_transactionId) {
      const getcharge = await prisma.charges.findFirst({
        where: { transactionId: charge_transactionId },
        select: { id: true },
      });
      chargeId = getcharge?.id || null;
    }

    const n_order = await resolveTextVariables({
      accountId: props.accountId,
      text: nOrder,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      nodeId: props.nodeId,
      numberLead: props.numberLead,
    });
    const getOrder = await prisma.orders.findFirst({
      where: { n_order },
      select: { id: true },
    });

    if (!getOrder) return "not_found";

    if (fields?.includes("name")) {
      restData.name = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.name || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("status")) {
      restData.status = restData.status || "pending";
    }

    if (fields?.includes("priority")) {
      restData.priority = restData.priority || "low";
    }

    if (fields?.includes("description")) {
      restData.description = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.description || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("origin")) {
      restData.origin = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.origin || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("delivery_method")) {
      restData.delivery_method = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.delivery_method || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("delivery_address")) {
      restData.delivery_address = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.delivery_address || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("total")) {
      restData.total = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.total || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("data")) {
      restData.data = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.data || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (fields?.includes("actionChannels")) {
      restData.actionChannels = restData.actionChannels.length
        ? restData.actionChannels
        : [];
    }

    const { updateAt } = await prisma.orders.update({
      where: { id: getOrder.id },
      data: {
        ...restData,
        actionChannels: restData.actionChannels.map((s) => s.text),
        ...(chargeId && { Charges: { connect: { id: chargeId } } }),
        ...(restData.status &&
          (restData.status === "confirmed" ||
            restData.status === "delivered") && {
            completedAt: new Date(),
          }),
      },
      select: { updateAt: true },
    });

    cacheAccountSocket.get(props.accountId)?.listSocket?.forEach((sockId) => {
      if (notify) {
        socketIo.to(sockId).emit(`notify-order`, {
          id: getOrder.id,
          accountId: props.accountId,
          title: "Pedido atualizado.",
          action: "update",
        });
      }

      socketIo.to(sockId).emit(`order`, {
        accountId: props.accountId,
        action: "update",
        order: {
          id: getOrder.id,
          ...(fields?.includes("status") && {
            status: restData.status,
          }),
          ...(fields?.includes("name") && {
            name: restData.name,
          }),
          ...(fields?.includes("data") && {
            data: restData.data,
          }),
          ...(fields?.includes("delivery_method") && {
            delivery_method: restData.delivery_method,
          }),
          ...(fields?.includes("priority") && {
            priority: restData.priority,
          }),
          ...(fields?.includes("delivery_address") && {
            delivery_address: restData.delivery_address,
          }),
          ...(fields?.includes("total") && {
            total: restData.total,
          }),
          ...(fields?.includes("actionChannels") && {
            actionChannels: restData.actionChannels.map((s) => s.text),
          }),
        },
      });
    });

    return "ok";
  } catch (error) {
    console.log(error);
    return "not_found";
  }
};

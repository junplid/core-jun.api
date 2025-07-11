import { NodeCreateOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { socketIo } from "../../../infra/express";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { resolveMoney } from "../utils/ResolveMoney";

interface PropsCreateOrder {
  numberLead: string;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeCreateOrderData;
  accountId: number;
  businessName: string;
  nodeId: string;
  flowStateId: number;
  flowId: string;
  action?: string;
}

export const NodeCreateOrder = async (
  props: PropsCreateOrder
): Promise<string | undefined> => {
  try {
    if (props.action) return props.action;

    let chargeId: number | null = null;

    if (props.data.charge_transactionId) {
      const getcharge = await prisma.charges.findFirst({
        where: { transactionId: props.data.charge_transactionId },
        select: { id: true },
      });
      chargeId = getcharge?.id || null;
    }

    const n_order = genNumCode(7);
    const {
      charge_transactionId,
      varId_save_nOrder,
      actionChannels,
      notify,
      ...restData
    } = props.data;

    if (restData.name) {
      restData.name = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.name,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (restData.origin) {
      restData.origin = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.origin,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (restData.description) {
      restData.description = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.description,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (restData.data) {
      restData.data = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.data,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    if (restData.total) {
      restData.total = String(
        resolveMoney(
          await resolveTextVariables({
            accountId: props.accountId,
            text: restData.total,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            numberLead: props.numberLead,
            nodeId: props.nodeId,
          })
        )
      );
    } else {
      restData.total = undefined;
    }

    if (restData.delivery_address) {
      restData.delivery_address = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.delivery_address,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    } else if (restData.delivery_method) {
      restData.delivery_method = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.delivery_method,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        numberLead: props.numberLead,
        nodeId: props.nodeId,
      });
    }

    const tracking_code = genNumCode(5);

    const { id, createAt, ContactsWAOnAccount } = await prisma.orders.create({
      data: {
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        flowStateId: props.flowStateId,
        flowNodeId: props.nodeId,
        connectionWAId: props.connectionWhatsId,
        flowId: props.flowId,
        n_order,
        tracking_code,
        ...restData,
        status: restData.status || "pending",
        ...(chargeId && { Charges: { connect: { id: chargeId } } }),
        ...(actionChannels?.length && {
          actionChannels: actionChannels.map((s) => s.text),
        }),
      },
      select: {
        id: true,
        createAt: true,
        Business: { select: { name: true, id: true } },
        ContactsWAOnAccount: {
          select: { ContactsWA: { select: { completeNumber: true } } },
        },
      },
    });

    if (varId_save_nOrder) {
      const exist = await prisma.variable.findFirst({
        where: { id: varId_save_nOrder, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: varId_save_nOrder,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save_nOrder,
              value: n_order,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: varId_save_nOrder,
              value: n_order,
            },
          });
        }
      }
    }

    cacheAccountSocket.get(props.accountId)?.listSocket?.forEach((sockId) => {
      if (notify) {
        socketIo.to(sockId).emit(`notify-order`, {
          id,
          accountId: props.accountId,
          title: "Novo pedido.",
          action: "new",
        });
      }
      socketIo.to(sockId).emit(`order`, {
        accountId: props.accountId,
        action: "new",
        order: {
          id,
          createAt,
          status: restData.status || "pending",
          n_order,
          name: restData.name,
          data: restData.data,
          contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
          delivery_method: restData.delivery_method,
          priority: restData.priority || "low",
          delivery_address: restData.delivery_address,
          total: restData.total,
          actionChannels: actionChannels.map((s) => s.text),
        },
      });
    });

    return;
  } catch (error) {
    console.log(error);
    return;
  }
};

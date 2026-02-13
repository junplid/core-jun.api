import { NodeCreateOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { genNumCode } from "../../../utils/genNumCode";
import { socketIo } from "../../../infra/express";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { resolveMoney } from "../utils/ResolveMoney";
import { cacheConnectionsWAOnline } from "../../../adapters/Baileys/Cache";
import { NotificationApp } from "../../../utils/notificationApp";
import { webSocketEmitToRoom } from "../../../infra/websocket";

interface PropsCreateOrder {
  lead_id: string;
  contactAccountId: number;
  connectionId: number;

  external_adapter:
    | { type: "baileys" }
    | { type: "instagram"; page_token: string };

  data: NodeCreateOrderData;
  accountId: number;
  businessName: string;
  nodeId: string;
  flowStateId: number;
  flowId: string;
  action?: string;
  actions?: {
    onCodeAppointment(code: string): void;
  };
}

export const NodeCreateOrder = async (
  props: PropsCreateOrder,
): Promise<string | undefined> => {
  try {
    if (props.action) return props.action;

    let chargeId: number | null = null;

    if (props.data.charge_transactionId) {
      const charge_transactionId = await resolveTextVariables({
        accountId: props.accountId,
        text: props.data.charge_transactionId,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
      const getcharge = await prisma.charges.findFirst({
        where: { txid: charge_transactionId },
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
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
    }

    if (restData.origin) {
      restData.origin = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.origin,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
    }

    if (restData.description) {
      restData.description = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.description,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
    }

    if (restData.data) {
      restData.data = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.data,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
    }

    if (restData.total) {
      restData.total = String(
        resolveMoney(
          await resolveTextVariables({
            accountId: props.accountId,
            text: restData.total,
            contactsWAOnAccountId: props.contactAccountId,
            numberLead: props.lead_id,
            nodeId: props.nodeId,
          }),
        ),
      );
    } else {
      restData.total = undefined;
    }

    if (restData.delivery_address) {
      restData.delivery_address = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.delivery_address,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
    } else if (restData.payment_method) {
      restData.payment_method = await resolveTextVariables({
        accountId: props.accountId,
        text: restData.payment_method,
        contactsWAOnAccountId: props.contactAccountId,
        numberLead: props.lead_id,
        nodeId: props.nodeId,
      });
    }

    const tracking_code = genNumCode(5);
    const last = await prisma.orders.findFirst({
      where: {
        accountId: props.accountId,
        status: restData.status || "pending",
      },
      orderBy: { rank: "desc" },
      select: { rank: true },
    });

    const GAP = 640;
    const newRank = last ? last.rank.plus(GAP) : GAP;

    const { id, createAt, ContactsWAOnAccount } = await prisma.orders.create({
      data: {
        accountId: props.accountId,
        contactsWAOnAccountId: props.contactAccountId,
        flowStateId: props.flowStateId,
        flowNodeId: props.nodeId,

        ...(props.external_adapter.type === "baileys"
          ? { connectionWAId: props.connectionId }
          : { connectionIgId: props.connectionId }),

        flowId: props.flowId,
        n_order,
        rank: newRank,
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
          select: {
            ContactsWA: { select: { completeNumber: true, username: true } },
            Tickets: {
              where: { status: { notIn: ["DELETED", "RESOLVED"] } },
              select: {
                ConnectionIg: { select: { ig_username: true } },
                ConnectionWA: { select: { name: true, id: true } },
                id: true,
                InboxDepartment: { select: { name: true } },
                status: true,
                Messages: {
                  take: 1,
                  orderBy: { id: "desc" },
                  select: { by: true },
                },
              },
            },
          },
        },
      },
    });

    props.actions?.onCodeAppointment(n_order);

    if (varId_save_nOrder) {
      const exist = await prisma.variable.findFirst({
        where: { id: varId_save_nOrder, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactAccountId,
            variableId: varId_save_nOrder,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactAccountId,
              variableId: varId_save_nOrder,
              value: n_order,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactAccountId,
              variableId: varId_save_nOrder,
              value: n_order,
            },
          });
        }
      }
    }

    if (notify) {
      await NotificationApp({
        accountId: props.accountId,
        title_txt: `Novo pedido`,
        tag: `new-order-${n_order}`,
        title_html: `Novo pedido`,
        body_txt: `${restData.name} - #${n_order}`,
        body_html: `<span className="font-medium text-sm line-clamp-1">Novo pedido</span><span className="text-xs font-light">${restData.name} - #${n_order}</span>`,
        url_redirect: "/auth/orders",
        onFilterSocket(sockets) {
          return sockets
            .filter((s) => s.focused !== `page-orders`)
            .map((s) => s.id);
        },
      });
    }

    webSocketEmitToRoom()
      .account(props.accountId)
      .orders.new_order(
        {
          id,
          name: restData.name,
          n_order,
          businessId: restData.businessId,
          description: restData.description,
          origin: restData.origin,
          createAt,
          delivery_address: restData.delivery_address,
          payment_method: restData.payment_method,
          actionChannels: actionChannels.map((s) => s.text),

          ...(props.external_adapter.type === "baileys"
            ? {
                channel: "baileys",
                contact: ContactsWAOnAccount?.ContactsWA.completeNumber,
              }
            : {
                channel: "instagram",
                contact: ContactsWAOnAccount?.ContactsWA.username,
              }),

          status: restData.status || "pending",
          priority: restData.priority || "low",
          data: restData.data,
          total: restData.total,
          sequence: newRank,
          isDragDisabled: restData.isDragDisabled,
          ticket:
            ContactsWAOnAccount?.Tickets.map((tk) => {
              let connection: any = {};

              if (tk.ConnectionWA?.name) {
                connection = {
                  s: !!cacheConnectionsWAOnline.get(tk.ConnectionWA?.id),
                  name: tk.ConnectionWA.name,
                  channel: "baileys",
                };
              }
              if (tk.ConnectionIg?.ig_username) {
                connection = {
                  s: true,
                  name: tk.ConnectionIg.ig_username,
                  channel: "instagram",
                };
              }

              return {
                connection,
                id: tk.id,
                // lastMessage: tk.Messages[0].by,
                departmentName: tk.InboxDepartment.name,
                status: tk.status,
              };
            }) || [],
        },
        [],
      );

    return;
  } catch (error) {
    console.log("", error);
    return;
  }
};

import { cacheConnectionsWAOnline } from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { socketIo } from "../../../infra/express";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { NotificationApp } from "../../../utils/notificationApp";
import { NodeTransferDepartmentData } from "../Payload";

interface PropsNodeTransferDepartment {
  data: NodeTransferDepartmentData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  connectionWAId: number;
  nodeId: string;
  accountId: number;
}

function getRandomNumber(min: number, max: number) {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export const NodeTransferDepartment = async (
  props: PropsNodeTransferDepartment
): Promise<"OK" | "ERROR"> => {
  try {
    const department = await prisma.inboxDepartments.findUnique({
      where: { id: props.data.id, accountId: props.accountId },
      select: { name: true, businessId: true },
    });

    if (!department) return "ERROR";

    const uniqueProtocol: string = await new Promise<string>((res) => {
      const protocol = getRandomNumber(10000000, 99999999);
      const checkProtocol = async (protocol: string) => {
        const getProtocol = await prisma.tickets.findFirst({
          where: { protocol },
        });
        if (getProtocol) {
          checkProtocol(getRandomNumber(10000000, 99999999));
        } else {
          res(protocol);
        }
      };
      checkProtocol(protocol);
    });

    const { id, createAt, ContactsWAOnAccount, ...t } =
      await prisma.tickets.create({
        data: {
          protocol: uniqueProtocol,
          destination: "department",
          connectionWAId: props.connectionWAId,
          contactWAOnAccountId: props.contactsWAOnAccountId,
          inboxDepartmentId: props.data.id,
          goBackFlowStateId: props.flowStateId,
          accountId: props.accountId,
          // atualizar o index do node quando a saida for OK no controlador
        },
        select: {
          id: true,
          createAt: true,
          ContactsWAOnAccount: { select: { name: true } },
          ConnectionWA: { select: { name: true } },
          InboxDepartment: { select: { name: true } },
        },
      });

    const orders = await prisma.orders.findMany({
      where: {
        deleted: false,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
      },
      select: { id: true, connectionWAId: true, status: true },
    });

    orders.forEach((order) => {
      if (!order.connectionWAId) return;
      const ticket = {
        connection: {
          s: !!cacheConnectionsWAOnline.get(order.connectionWAId),
          id: props.connectionWAId,
          name: t.ConnectionWA.name,
        },
        id,
        // lastMessage: "system",
        departmentName: t.InboxDepartment.name,
        status: "NEW",
      };

      cacheAccountSocket
        .get(props.accountId)
        ?.listSocket?.forEach(async (sockId) => {
          socketIo.to(sockId.id).emit(`order:ticket:new`, {
            accountId: props.accountId,
            status: order.status,
            orderId: order.id,
            ticket,
          });
        });
    });

    // aqui tem um problema, notificar o inbox, mas se o ticket estiver atrelado a um pedido?
    // qual sera prioridade?

    // >>> que tal, quando abrir novo ticket a notificação será neutra,
    // tendo o redirect para o modal de chatplayer
    // enviar informação de pedido caso esse tiket tenha.

    await NotificationApp({
      accountId: props.accountId,
      title_txt: `Novo ticket`,
      title_html: `Novo ticket`,
      body_txt: `"${ContactsWAOnAccount.name}" está aguardando`,
      body_html: `<span className="font-medium text-sm line-clamp-1">Novo ticket</span>
<span className="text-xs font-light">
  ${ContactsWAOnAccount.name} está
  <span className="text-orange-300 font-medium"> aguardando</span>
  ...
</span>`,
      url_redirect: `$self/?open_ticket=${id}&bId=${department.businessId}&name=${ContactsWAOnAccount.name}`,
      onFilterSocket(sockets) {
        return sockets
          .filter((s) => s.focused !== `modal-department-${props.data.id}`)
          .map((s) => s.id);
      },
    });

    const isOnline = !!cacheAccountSocket
      .get(props.accountId)
      ?.listSocket.some(
        (s) => s.focused === `modal-department-${props.data.id}`
      );
    if (isOnline) {
      socketIo.of(`/business-${department.businessId}/inbox`).emit("list", {
        status: "NEW",
        forceOpen: false,
        departmentId: props.data.id,
        name: ContactsWAOnAccount.name,
        lastInteractionDate: createAt,
        id,
        userId: undefined, // caso seja enviado para um usuário.
      });
    }

    return "OK";
  } catch (error) {
    return "ERROR";
  }
};

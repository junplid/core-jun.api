import { prisma } from "../../../adapters/Prisma/client";
import { socketIo } from "../../../infra/express";
import { cacheAccountSocket } from "../../../infra/websocket/cache";
import { NodeTransferDepartmentData } from "../Payload";

interface PropsNodeTransferDepartment {
  data: NodeTransferDepartmentData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  connectionWAId: number;
  nodeId: string;
  accountId: number;
}

interface PropsInbox {
  accountId: number;
  departmentId: number;
  departmentName: string;
  status: "NEW" | "MESSAGE";
  notifyMsc: boolean;
  notifyToast: boolean;
  id: number;
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

    const { id, createAt, ContactsWAOnAccount } = await prisma.tickets.create({
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
      },
    });

    cacheAccountSocket.get(props.accountId)?.listSocket?.forEach((sockId) => {
      socketIo.to(sockId).emit(`inbox`, {
        accountId: props.accountId,
        departmentId: props.data.id,
        departmentName: department.name,
        status: "NEW",
        notifyMsc: true,
        notifyToast: true,
        id,
      } as PropsInbox);

      socketIo.of(`/business-${department.businessId}/inbox`).emit("list", {
        status: "NEW",
        forceOpen: false,
        departmentId: props.data.id,
        notifyMsc: true,
        notifyToast: false,
        name: ContactsWAOnAccount.name,
        lastInteractionDate: createAt,
        id,
        userId: undefined, // caso seja enviado para um usuário.
      });
    });

    return "OK";
  } catch (error) {
    return "ERROR";
  }
};

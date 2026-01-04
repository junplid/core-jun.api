import { TypeChannelsNotification } from "@prisma/client";
import { prisma } from "../adapters/Prisma/client";
import { cacheAccountSocket } from "../infra/websocket/cache";
import { socketIo } from "../infra/express";
import { sendPushNotification } from "../services/push/sendPushNotification";

type Props = {
  type?: string;
  title_txt: string;
  body_txt: string;
  title_html?: string;
  body_html?: string;
  toast_position?: string;
  toast_duration?: number;
  url_redirect?: string; // `$self/?open_ticket=1` ///// o self significa que a url deve ser incrementada
  accountId: number | null;
  onFilterSocket?(
    sockets: {
      id: string;
      platform: "android" | "ios" | "desktop";
      isMobile: boolean;
      isPWA: boolean;
      focused: null | string;
    }[]
  ): string[];
};

export async function NotificationApp({
  accountId,
  onFilterSocket,
  ...props
}: Props) {
  if (!accountId) {
    // TODO:
    // notificar todos os accounts via websockets
    // e os offline via push
    return;
  }

  const accountSocket = cacheAccountSocket.get(accountId);
  let channel: TypeChannelsNotification = "websocket";

  let listSocket: string[] = [];
  if (accountSocket) {
    if (onFilterSocket) {
      listSocket = onFilterSocket(accountSocket.listSocket);
    } else {
      accountSocket.listSocket.map((s) => s.id);
    }
  }

  if (listSocket.length) {
    listSocket.forEach(async (skt) => {
      socketIo.to(skt).emit("notification", props);
    });
  } else {
    channel = "push";
    await sendPushNotification(accountId, {
      title: props.title_txt,
      body: props.body_txt,
      url: props.url_redirect,
    });
  }

  await prisma.notifications.create({
    data: { ...props, accountId, channels: [channel] },
  });
}

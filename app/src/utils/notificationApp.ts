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
  url_redirect?: string; // `#self/?open_ticket=1` ///// o self significa que a url deve ser incrementada
  accountId: number | null;
};

export async function NotificationApp({ accountId, ...props }: Props) {
  if (!accountId) {
    // TODO:
    // notificar todos os accounts via websockets
    // e os offline via push
    return;
  }

  const accountSocket = cacheAccountSocket.get(accountId);
  let channel: TypeChannelsNotification = "websocket";

  if (accountSocket && accountSocket.listSocket.length) {
    accountSocket.listSocket.forEach(async (skt) => {
      if (skt.platform === "android") {
        channel = "push";
        await sendPushNotification(accountId, {
          title: props.title_txt,
          body: props.body_txt,
          url: props.url_redirect,
        });
      }
      socketIo.to(skt.id).emit("notification", props);
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

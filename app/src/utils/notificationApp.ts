import { TypeChannelsNotification } from "@prisma/client";
import { prisma } from "../adapters/Prisma/client";
import { sendPushNotification } from "../services/push/sendPushNotification";
import { webSocketEmitToRoom } from "../infra/websocket";

type Props = {
  type?: string;
  title_txt: string;
  body_txt: string;
  title_html?: string;
  body_html?: string;
  tag: string;
  toast_position?: string;
  toast_duration?: number;
  url_redirect?: string; // `$self/?open_ticket=1` ///// o self significa que a url deve ser incrementada
  accountId: number | null;
  sendTo?: ("push" | "toast")[];
};

export async function NotificationApp({
  accountId,
  sendTo,
  tag,
  ...props
}: Props) {
  if (!accountId) {
    // TODO:
    // notificar todos os accounts via websockets
    // e os offline via push
    return;
  }

  let channel: TypeChannelsNotification = "websocket";

  if (!sendTo || sendTo.includes("push")) {
    channel = "push";
    await sendPushNotification(accountId, {
      title: props.title_txt,
      body: props.body_txt,
      url: props.url_redirect,
      tag,
    });
  }

  if (!sendTo || sendTo.includes("toast")) {
    webSocketEmitToRoom().account(accountId).toast_notification(props, []);
  }

  await prisma.notifications.create({
    data: { ...props, accountId, channels: [channel] },
  });
}

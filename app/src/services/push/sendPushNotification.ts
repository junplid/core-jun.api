import { prisma } from "../../adapters/Prisma/client";
import admin from "../firebase/admin";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag: string;
};

export async function sendPushNotification(
  accountId: number,
  payload: PushPayload,
) {
  const tokens = await prisma.pushTokens.findMany({
    where: { accountId },
    select: { token: true, platform: true },
  });

  if (!tokens.length) return;

  const pwaTokens = tokens.filter((t) => t.platform === "pwa");
  const webTokens = tokens.filter((t) => t.platform !== "pwa");

  const tokensToSend = pwaTokens.length > 0 ? pwaTokens : webTokens;

  const message = {
    data: {
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/",
      tag: payload.tag,
    },
  };

  const results = await Promise.allSettled(
    tokensToSend.map((t) =>
      admin.messaging().send({
        ...message,
        token: t.token,
      }),
    ),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const token = tokensToSend[i];

    if (result.status === "fulfilled") {
      await prisma.pushTokens.update({
        where: { token: token.token },
        data: { lastUsedAt: new Date() },
      });
    } else {
      if (result.status === "rejected") {
        const error = result.reason;

        const errorCode = error?.errorInfo?.code;

        const shouldDelete =
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token";

        if (shouldDelete) {
          await prisma.pushTokens.delete({
            where: { token: token.token },
          });
        }
      }
    }
  }
}

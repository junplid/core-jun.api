import { prisma } from "../../adapters/Prisma/client";
import admin from "../firebase/admin";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendPushNotification(
  accountId: number,
  payload: PushPayload
) {
  const tokens = await prisma.pushTokens.findMany({
    where: { accountId },
  });

  if (!tokens.length) return;

  const message = {
    data: {
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/",
    },
  };

  const results = await Promise.allSettled(
    tokens.map((t) =>
      admin.messaging().send({
        ...message,
        token: t.token,
      })
    )
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const token = tokens[i];

    if (result.status === "fulfilled") {
      await prisma.pushTokens.update({
        where: { token: token.token },
        data: { lastUsedAt: new Date() },
      });
    } else {
      await prisma.pushTokens.delete({
        where: { token: token.token },
      });
    }
  }
}

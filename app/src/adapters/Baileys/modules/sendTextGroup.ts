import { proto } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";
import { prisma } from "../../Prisma/client";

interface Props {
  connectionId: number;
  text: string;
  groupName: string;
}

export const SendTextGroup = async ({
  connectionId,
  ...props
}: Props): Promise<proto.WebMessageInfo | undefined> => {
  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<proto.WebMessageInfo | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId)) {
      throw new Error("CONEXÃO OFFLINE");
    }
    const getGroup = await prisma.connectionWAOnGroups.findFirst({
      where: { name: props.groupName },
      select: { jid: true },
    });
    if (!getGroup?.jid) return;
    return bot.sendMessage(getGroup.jid, { text: props.text });
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await tryAtt();
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
};

import { proto } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import { messageCache, sessionsBaileysWA } from "..";
import { safeSendMessage } from "./safeSend";

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
    const allGroups = await bot.groupFetchAllParticipating();
    const group = Object.values(allGroups).find((g) => {
      return g.subject === props.groupName;
    });
    if (!group?.id) return;

    return await safeSendMessage(bot, group.id, { text: props.text });
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

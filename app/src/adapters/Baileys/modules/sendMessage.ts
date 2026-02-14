import { proto, WAMessage } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";
import { safeSendMessage } from "./safeSend";

interface Props {
  connectionId: number;
  text: string;
  toNumber: string;
  quoted?: WAMessage;
}

export const SendMessageText = async ({
  connectionId,
  quoted,
  ...props
}: Props): Promise<WAMessage | undefined> => {
  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<WAMessage | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");
    return safeSendMessage(bot, props.toNumber, { text: props.text }, quoted);
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

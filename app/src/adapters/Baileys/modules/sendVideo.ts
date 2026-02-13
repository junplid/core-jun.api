import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";
import { proto, WAMessage } from "baileys";
import { safeSendMessage } from "./safeSend";

interface Props {
  connectionId: number;
  toNumber: string;
  mimetype?: string;
  video: Buffer;
  caption?: string;
}

export const SendVideo = async ({
  connectionId,
  ...props
}: Props): Promise<WAMessage | undefined> => {
  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<WAMessage | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");
    return await safeSendMessage(bot, props.toNumber, {
      video: props.video,
      mimetype: props.mimetype,
      caption: props.caption,
    });
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

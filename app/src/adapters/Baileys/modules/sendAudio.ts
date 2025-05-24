import { proto } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";

interface Props {
  connectionId: number;
  toNumber: string;
  mimetype?: string;
  urlStatic: string;
}

export const SendAudio = async ({
  connectionId,
  ...props
}: Props): Promise<proto.WebMessageInfo | undefined> => {
  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<proto.WebMessageInfo | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");
    return await bot.sendMessage(props.toNumber, {
      audio: { url: props.urlStatic },
      ptt: true,
      mimetype: props.mimetype,
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

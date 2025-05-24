import { proto } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";

interface Props {
  connectionId: number;
  toNumber: string;
  mimetype?: string;
  document: Buffer;
  caption?: string;
  originalName: string;
}

export const SendFile = async ({
  connectionId,
  ...props
}: Props): Promise<proto.WebMessageInfo | undefined> => {
  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<proto.WebMessageInfo | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");
    return await bot?.sendMessage(props.toNumber, {
      document: props.document,
      mimetype: props.mimetype || "text/plain",
      caption: props.caption,
      fileName: props.originalName,
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

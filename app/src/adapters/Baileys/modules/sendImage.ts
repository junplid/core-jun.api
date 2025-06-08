import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";
import { proto } from "baileys";
import { lookup } from "mime-types";
import path from "path";
import { Jimp } from "jimp";

interface Props {
  connectionId: number;
  toNumber: string;
  caption?: string;
  url: string;
}

export const SendImage = async ({
  connectionId,
  ...props
}: Props): Promise<proto.WebMessageInfo | undefined> => {
  const MAX_ATTEMPTS = 5;
  const tryAtt = async (): Promise<proto.WebMessageInfo | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");
    const mimetype = lookup(props.url) || "image/jpeg";
    const fileName = path.basename(props.url);

    const img = await Jimp.read(props.url);
    const buffer = await img.getBuffer(mimetype as any);

    return await bot.sendMessage(props.toNumber, {
      image: buffer,
      //  jpegThumbnail: props.url,
      mimetype,
      caption: props.caption,
      fileName,
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

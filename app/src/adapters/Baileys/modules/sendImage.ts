import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";
import { proto } from "baileys";
import { lookup } from "mime-types";
import path from "path";
import Jimp from "jimp";
import sharp from "sharp";
import { promises as fs } from "fs";
import { safeSendMessage } from "./safeSend";

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

    const buffer = await fs.readFile(props.url);

    const thumbnail = await sharp(buffer)
      .rotate()
      .resize({ width: 200 })
      .jpeg({ quality: 30 })
      .toBuffer();

    return await safeSendMessage(bot, props.toNumber, {
      image: buffer,
      jpegThumbnail: thumbnail,
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

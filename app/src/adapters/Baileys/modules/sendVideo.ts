import { cacheBaileys_SocketInReset } from "../Cache";
import { sessionsBaileysWA } from "..";

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
}: Props): Promise<void> => {
  return new Promise<void>(async (res, rej) => {
    const run = async (): Promise<void> => {
      try {
        const botIsReset = cacheBaileys_SocketInReset.get(connectionId);
        const bot = sessionsBaileysWA.get(connectionId);

        if (!!botIsReset) {
          await new Promise((r) => setTimeout(r, 4000));
          return run();
        } else {
          await bot?.sendMessage(props.toNumber, {
            video: props.video,
            mimetype: props.mimetype,
            caption: props.caption,
          });

          res();
        }
      } catch (error) {
        const botIsReset = cacheBaileys_SocketInReset.get(connectionId);
        if (!!botIsReset) {
          await new Promise((r) => setTimeout(r, 4000));
          return run();
        }
        rej("BAILEYS - Error ao enviar mensagem");
      }
    };

    await run();
  });
};

import { cacheBaileys_SocketInReset } from "../Cache";
import { sessionsBaileysWA } from "..";
import { proto } from "baileys";

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
  return new Promise<proto.WebMessageInfo | undefined>(async (res, rej) => {
    const run = async (): Promise<void> => {
      try {
        const botIsReset = cacheBaileys_SocketInReset.get(connectionId);
        const bot = sessionsBaileysWA.get(connectionId);

        if (!!botIsReset) {
          await new Promise((r) => setTimeout(r, 4000));
          return run();
        } else {
          const msg = await bot?.sendMessage(props.toNumber, {
            image: { url: props.url },
            caption: props.caption,
          });
          res(msg);
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

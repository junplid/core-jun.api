import { proto } from "baileys";
import { cacheBaileys_SocketInReset } from "../Cache";
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
            audio: { url: props.urlStatic },
            ptt: true,
            mimetype: props.mimetype,
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

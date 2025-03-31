import { sessionsBaileysWA } from "..";
import { cacheBaileys_SocketInReset } from "../Cache";

interface Props {
  connectionId: number;
  toNumber: string;
  delay?: number;
}

export const TypingDelay = async ({
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
          let delayDefault = 2;
          if (!props.delay) {
          } else if (props.delay > 2) {
            delayDefault = props.delay;
          }
          await bot?.sendPresenceUpdate("composing", props.toNumber);
          await new Promise((r) => setTimeout(r, delayDefault * 1000));
          await bot?.sendPresenceUpdate("available", props.toNumber);
          res();
        }
      } catch (error) {
        const botIsReset = cacheBaileys_SocketInReset.get(connectionId);
        if (!!botIsReset) {
          await new Promise((r) => setTimeout(r, 4000));
          return run();
        }
        rej("BAILEYS - Error ao digitar");
      }
    };

    run();
  });
};

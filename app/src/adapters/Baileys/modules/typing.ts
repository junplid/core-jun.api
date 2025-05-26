import { sessionsBaileysWA } from "..";
import { cacheConnectionsWAOnline } from "../Cache";

interface Props {
  connectionId: number;
  toNumber: string;
  delay?: number;
}

export const TypingDelay = async ({
  connectionId,
  delay = 2,
  ...props
}: Props): Promise<void> => {
  const MAX_ATTEMPTS = 5;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const tryAtt = async (): Promise<void> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");
    await bot.sendPresenceUpdate("composing", props.toNumber);
    await wait(Math.max(delay, 2) * 1_000);
    await bot.sendPresenceUpdate("available", props.toNumber);
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

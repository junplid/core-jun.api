import { sessionsBaileysWA } from "..";
import { webSocketEmitToRoom } from "../../../infra/websocket";
import { cacheConnectionsWAOnline } from "../Cache";

type Props =
  | {
      connectionId: number;
      toNumber: string;
      delay?: number;
      mode: "prod";
    }
  | {
      mode: "testing";
      delay?: number;
      token_modal_chat_template: string;
      accountId: number;
    };

export const TypingDelay = async (props: Props): Promise<void> => {
  const delay = Math.max(props.delay || 0, 0);
  if (!delay) return;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  if (props.mode === "testing") {
    const { emit } = webSocketEmitToRoom().account(props.accountId);
    emit(
      `test-agent-template-${props.token_modal_chat_template}`,
      { role: "agent", content: "", compose: true },
      [],
    );
    await wait(delay * 1_000);
    emit(
      `test-agent-template-${props.token_modal_chat_template}`,
      { role: "agent", content: "", compose: false },
      [],
    );
    return;
  }

  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<void> => {
    const bot = sessionsBaileysWA.get(props.connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(props.connectionId))
      throw new Error("CONEXÃO OFFLINE");
    await bot.sendPresenceUpdate("composing", props.toNumber);
    await wait(delay * 1_000);
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

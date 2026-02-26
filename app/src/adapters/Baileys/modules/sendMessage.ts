import { proto, WAMessage } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import { sessionsBaileysWA } from "..";
import { safeSendMessage } from "./safeSend";
import { webSocketEmitToRoom } from "../../../infra/websocket";

type Props =
  | {
      connectionId: number;
      text: string;
      toNumber: string;
      quoted?: WAMessage;
      mode: "prod";
    }
  | {
      mode: "testing";
      text: string;
      token_modal_chat_template: string;
      accountId: number;
      role: "agent" | "system";
    };

export const SendMessageText = async (
  props: Props,
): Promise<WAMessage | undefined> => {
  if (props.mode === "testing") {
    webSocketEmitToRoom()
      .account(props.accountId)
      .emit(
        `test-agent-template-${props.token_modal_chat_template}`,
        { role: props.role, content: props.text },
        [],
      );
    return;
  }

  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<WAMessage | undefined> => {
    const bot = sessionsBaileysWA.get(props.connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(props.connectionId))
      throw new Error("CONEXÃO OFFLINE");
    return safeSendMessage(
      bot,
      props.toNumber,
      { text: props.text },
      props.quoted,
    );
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

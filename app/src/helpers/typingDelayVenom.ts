import { WASocket } from "baileys";

export const baileysWATypingDelay = (props: {
  delay?: number;
  toNumber: string;
  botWA: WASocket;
}): Promise<void> =>
  new Promise(async (resa) => {
    let delayDefault = 2;
    if (!props.delay) {
    } else if (props.delay > 2) {
      delayDefault = props.delay;
    }
    try {
      await props.botWA.sendPresenceUpdate("composing", props.toNumber);
      setTimeout(async () => {
        resa();
      }, delayDefault * 1000);
    } catch (error: any) {
      console.log("error para digitar");
      console.log(new Object(error));
      throw error;
    }
  });

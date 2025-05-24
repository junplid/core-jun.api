import { proto } from "baileys";
import { cacheConnectionsWAOnline } from "../Cache";
import phone from "libphonenumber-js";
import { sessionsBaileysWA } from "..";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";

interface Props {
  connectionId: number;
  toNumber: string;
  numberSend: string;
  fullName: string;
  org: string;
}

export const SendContact = async ({
  connectionId,
  ...props
}: Props): Promise<proto.WebMessageInfo | undefined> => {
  const MAX_ATTEMPTS = 5;

  const tryAtt = async (): Promise<proto.WebMessageInfo | undefined> => {
    const bot = sessionsBaileysWA.get(connectionId);
    if (!bot || !cacheConnectionsWAOnline.get(connectionId))
      throw new Error("CONEXÃO OFFLINE");

    const verifiedNumber = phone(props.numberSend, {
      defaultCountry: "BR",
      extract: true,
      defaultCallingCode: "55",
    });
    const waId = validatePhoneNumber(props.numberSend, {
      removeNine: true,
    });

    if (!verifiedNumber || !waId) {
      throw new Error("Error ao tentar recuperar número do lead");
    }

    const formatNumber = verifiedNumber.formatInternational().split(" ");
    const prevP = formatNumber.join(" ");

    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      `FN:${props.fullName}\n` +
      `${props.org ? `ORG:${props.org};\n` : "ORG:;\n"}` +
      `TEL;type=CELL;type=VOICE;waid=${waId}:${prevP}\n` +
      `END:VCARD`;

    return await bot?.sendMessage(props.toNumber + "@s.whatsapp.net", {
      contacts: {
        displayName: props.fullName.split(" ")[0],
        contacts: [{ vcard }],
      },
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

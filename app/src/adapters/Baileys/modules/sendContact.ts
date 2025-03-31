import { proto } from "baileys";
import { cacheBaileys_SocketInReset } from "../Cache";
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
  return new Promise<proto.WebMessageInfo | undefined>(async (res, rej) => {
    const run = async (): Promise<void> => {
      try {
        const botIsReset = cacheBaileys_SocketInReset.get(connectionId);
        const bot = sessionsBaileysWA.get(connectionId);

        if (!!botIsReset) {
          await new Promise((r) => setTimeout(r, 4000));
          return run();
        } else {
          const verifiedNumber = phone(props.numberSend, {
            defaultCountry: "BR",
            extract: true,
            defaultCallingCode: "55",
          });
          const waId = validatePhoneNumber(props.numberSend, {
            removeNine: true,
          });

          if (!verifiedNumber || !waId) {
            return rej("Error ao tentar recuperar número do lead");
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

          const msg = await bot?.sendMessage(
            props.toNumber + "@s.whatsapp.net",
            {
              contacts: {
                displayName: props.fullName.split(" ")[0],
                contacts: [{ vcard }],
              },
            }
          );
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

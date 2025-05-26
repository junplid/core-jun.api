import { WASocket } from "baileys";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { NodeSendContactData } from "../Payload";
import phone from "libphonenumber-js";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendContact } from "../../../adapters/Baileys/modules/sendContact";

interface PropsNodeReply {
  data: NodeSendContactData;
  numberLead: string;
  nodeId: string;
  connectionId: number;
}

export const NodeSendContact = (props: PropsNodeReply): Promise<void> =>
  new Promise(async (res, rej) => {
    const { data } = props;

    const verifiedNumber = phone(data.number, {
      defaultCountry: "BR",
      extract: true,
      defaultCallingCode: "55",
    });
    const waId = validatePhoneNumber(data.number, { removeNine: true });

    if (!verifiedNumber || !waId) {
      console.log("Deu erro para recuperar número do lead", data.number);
      return;
    }

    const formatNumber = verifiedNumber.formatInternational().split(" ");
    const prevP = formatNumber.join(" ");

    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      `FN:${data.fullName}\n` +
      `${data.org ? `ORG:${data.org};\n` : "ORG:;\n"}` +
      `TEL;type=CELL;type=VOICE;waid=${waId}:${prevP}\n` +
      `END:VCARD`;

    try {
      await TypingDelay({
        connectionId: props.connectionId,
        toNumber: props.numberLead,
        delay: data.interval,
      });

      await SendContact({
        connectionId: props.connectionId,
        fullName: data.fullName,
        org: data.org,
        numberSend: props.data.number,
        toNumber: props.numberLead,
      });
    } catch (error) {
      return rej();
    }
    return res();
  });

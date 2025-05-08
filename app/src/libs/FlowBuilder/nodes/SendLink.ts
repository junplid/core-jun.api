import { WASocket } from "baileys";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { NodeSendLinkData } from "../Payload";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

interface PropsNodeReply {
  data: NodeSendLinkData;
  numberLead: string;
  contactsWAOnAccountId: number;
  nodeId: string;
  connectionId: number;
}

export const NodeSendLink = (props: PropsNodeReply): Promise<void> =>
  new Promise(async (res, rej) => {
    const { data, numberLead } = props;

    // const urlFromText = extractUrlFromText(data.link);
    // let linkPreview;

    // if (urlFromText) {
    //   try {
    //     linkPreview = await getUrlInfo(urlFromText, {
    //       thumbnailWidth: 1200,
    //       fetchOpts: {
    //         timeout: 5000,
    //       },
    //       uploadImage: botWA.waUploadToServer,
    //     });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
    try {
      await TypingDelay({
        connectionId: props.connectionId,
        toNumber: numberLead,
        delay: data.interval,
      });

      await SendMessageText({
        connectionId: props.connectionId,
        toNumber: numberLead,
        text: data.link,
      });
    } catch (error) {
      return rej();
    }
    return res();
  });

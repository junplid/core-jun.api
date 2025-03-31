import { WASocket } from "baileys";
import { baileysWATypingDelay } from "../../../helpers/typingDelayVenom";
import { NodeSendLocationGPSData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendLocation } from "../../../adapters/Baileys/modules/sendLocation";

interface PropsNodeReply {
  data: NodeSendLocationGPSData;
  numberLead: string;
  contactsWAOnAccountId: number;
  nodeId: string;
  connectionId: number;
}

export const NodeSendLocationGPS = (props: PropsNodeReply): Promise<void> =>
  new Promise(async (res, rej) => {
    const { data, numberLead } = props;

    const location = await prisma.geolocation.findFirst({
      where: { id: data.geolocationId },
      select: {
        name: true,
        latitude: true,
        longitude: true,
        address: true,
      },
    });

    if (!location) return rej();
    try {
      await TypingDelay({
        connectionId: props.connectionId,
        toNumber: numberLead,
        delay: data.interval,
      });

      await SendLocation({
        connectionId: props.connectionId,
        location,
        toNumber: numberLead,
      });
    } catch (error) {
      return rej();
    }
    return res();
  });

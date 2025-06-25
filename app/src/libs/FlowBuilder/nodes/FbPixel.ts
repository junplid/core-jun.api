import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeFbPixelData } from "../Payload";
import {
  CustomData,
  EventRequest,
  ServerEvent,
  UserData,
} from "facebook-nodejs-business-sdk";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { listFbChatbot } from "../../../utils/cachesMap";

interface PropsFbPixel {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeFbPixelData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
  flowStateId: number;
}

export const NodeFbPixel = (props: PropsFbPixel): Promise<void> => {
  return new Promise(async (res, rej) => {
    const getFbPixel = await prisma.fbPixel.findFirst({
      where: { id: props.data.fbPixelId, accountId: props.accountId },
      select: { access_token: true, pixel_id: true },
    });

    if (!getFbPixel) return res();

    try {
      const userData = new UserData();
      userData.setPhone("+" + props.numberLead);
      const customData = new CustomData();

      const keyMap: Record<string, any> = {
        user: userData,
        custom: customData,
      };

      Object.entries(props.data.event).forEach(async ([key, value]) => {
        if (key !== "customContents" && key !== "name") {
          let nextData: any = null;
          const prefix = key.match(/^(user|custom)/)?.[0];
          const method = `set${key.replace(prefix!, "")}`;
          nextData = keyMap[prefix!][method];

          const nextValue = await resolveTextVariables({
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            text: value,
            ticketProtocol: props.ticketProtocol,
            numberLead: props.numberLead,
            nodeId: props.nodeId,
          });
          nextData(nextValue);
        }
      });

      const dataFb = await prisma.flowState.findFirst({
        where: { id: props.flowStateId, expires_at: { gte: new Date() } },
        select: {
          fbc: true,
          fbp: true,
          ip: true,
          ua: true,
          chatbotId: true,
          expires_at: true,
        },
      });

      if (dataFb?.chatbotId) {
        const { fbc, fbp, ip, ua } = dataFb;
        if (!fbc || !fbp) {
          const listfb = listFbChatbot.get(dataFb.chatbotId) || [];
          if (listfb.length) {
            const picked = structuredClone(listfb[0]);
            listfb.shift();
            listFbChatbot.set(dataFb.chatbotId, listfb);
            if (picked) {
              userData.setFbc(picked.fbc);
              userData.setFbp(picked.fbp);
              if (picked.ip) userData.setClientIpAddress(picked.ip);
              if (picked.ua) userData.setClientUserAgent(picked.ua);
              await prisma.flowState.update({
                where: { id: props.flowStateId },
                data: {
                  ...picked,
                  expires_at: new Date(Date.now() + 90 * 24 * 3600_000),
                },
              });
            }
          }
        } else {
          userData.setFbc(fbc);
          userData.setFbp(fbp);
          if (ip) userData.setClientIpAddress(ip);
          if (ua) userData.setClientUserAgent(ua);
        }
      }

      const serverEvent = new ServerEvent()
        .setEventName(props.data.event.name)
        .setEventTime(Math.floor(Number(new Date()) / 1000))
        .setUserData(userData)
        .setCustomData(customData)
        .setEventSourceUrl("https://wa.me/" + props.numberLead)
        .setActionSource("chat");

      const eventRequest = new EventRequest(
        getFbPixel.access_token,
        getFbPixel.pixel_id
      ).setEvents([serverEvent]);

      await eventRequest.execute();
      return res();
    } catch (error) {
      console.log("======================= Error in NodeFbPixel:", error);
      return res();
    }
  });
};

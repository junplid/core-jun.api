import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeFacebookConversionsData } from "../Payload";
import {
  CustomData,
  EventRequest,
  ServerEvent,
  UserData,
} from "facebook-nodejs-business-sdk";

interface PropsFacebookConversions {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWhatsId: number;
  data: NodeFacebookConversionsData;
  accountId: number;
  businessName: string;
  ticketProtocol?: string;
  nodeId: string;
}

export const NodeFacebookConversions = (
  props: PropsFacebookConversions
): Promise<void> => {
  return new Promise(async (res, rej) => {
    const findFbIntegration = await prisma.facebookIntegration.findUnique({
      where: { id: props.data.fbIntegrationId },
      select: { access_token: true },
    });

    if (!findFbIntegration?.access_token) return res();

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

          // @ts-expect-error
          if (value.varId) {
            const findVar =
              await prisma.contactsWAOnAccountVariableOnBusiness.findFirst({
                where: {
                  contactsWAOnAccountId: props.contactsWAOnAccountId,
                  VariableOnBusiness: {
                    // @ts-expect-error
                    variableId: value.varId,
                  },
                },
                select: { value: true },
              });
            if (findVar) {
              nextData(findVar.value);
            }
          } else {
            // @ts-expect-error
            nextData(value.customValue);
          }
        }
      });

      const serverEvent = new ServerEvent()
        .setEventName(props.data.event.name)
        .setEventTime(Math.floor(Number(new Date()) / 1000))
        .setUserData(userData)
        .setCustomData(customData)
        .setEventSourceUrl("https://wa.me/" + props.numberLead)
        .setActionSource("chat");

      const eventRequest = new EventRequest(
        findFbIntegration.access_token,
        props.data.fbPixelId
      ).setEvents([serverEvent]);

      await eventRequest.execute();
      return res();
    } catch (error) {
      return res();
    }
  });
};

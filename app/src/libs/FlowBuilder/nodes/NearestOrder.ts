import { NodeNearestOrderData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import {
  buildRoute,
  distanceGeo,
  generateGoogleMapsLink,
} from "../../../utils/generate-router-google";

type PropsNearestOrder =
  | {
      numberLead: string;
      contactsWAOnAccountId: number;
      data: NodeNearestOrderData;
      accountId: number;
      nodeId: string;
      flowStateId: number;
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      accountId: number;
    };

export const NodeNearestOrder = async (
  props: PropsNearestOrder,
): Promise<"not_found" | "ok"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou buscar pedido, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return "ok";
  }

  try {
    const { geo_string, varId_save_code_order } = props.data;

    if (!varId_save_code_order) return "not_found";

    const resolvergeo = await resolveTextVariables({
      accountId: props.accountId,
      text: geo_string,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    const geosplit = resolvergeo.split("|");
    if (geosplit.length !== 2) return "not_found";
    const [lat, lng] = [Number(geosplit[0]), Number(geosplit[1])];
    if (isNaN(lat) || isNaN(lng)) return "not_found";

    const resolvercode = await resolveTextVariables({
      accountId: props.accountId,
      text: geo_string,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    const getRouter = await prisma.deliveryRouter.findFirst({
      where: {
        n_router: resolvercode,
        contactsWAOnAccountId: props.contactsWAOnAccountId,
      },
      select: {
        DeliveryRouterOnOrders: {
          select: {
            Order: {
              select: {
                n_order: true,
                delivery_lat: true,
                delivery_lng: true,
              },
            },
          },
        },
      },
    });

    if (!getRouter || !getRouter.DeliveryRouterOnOrders.length)
      return "not_found";

    const geolist = getRouter.DeliveryRouterOnOrders.map((dr) => {
      if (dr.Order.delivery_lat && dr.Order.delivery_lng)
        return {
          lat: dr.Order.delivery_lat,
          lng: dr.Order.delivery_lng,
          n_order: dr.Order.n_order,
        };
    }).filter((s) => s) as { lat: number; lng: number; n_order: string }[];

    const resultado =
      geolist.length === 0
        ? null
        : (geolist
            .map((p) => ({
              ponto: p,
              dist: distanceGeo({ lat, lng }, p),
            }))
            .filter((p) => p.dist <= 0.06)
            .sort((a, b) => a.dist - b.dist)[0]?.ponto ?? null);

    if (!resultado) return "not_found";

    if (varId_save_code_order) {
      const exist = await prisma.variable.findFirst({
        where: { id: varId_save_code_order, type: "dynamics" },
        select: { id: true },
      });

      if (exist) {
        const picked = await prisma.contactsWAOnAccountVariable.findFirst({
          where: {
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            variableId: exist.id,
          },
          select: { id: true },
        });
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: resultado.n_order,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: resultado.n_order,
            },
          });
        }
      }
    }

    return "ok";
  } catch (error) {
    return "not_found";
  }
};

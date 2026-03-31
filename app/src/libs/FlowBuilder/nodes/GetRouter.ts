import { NodeGetRouterData } from "../Payload";
import { prisma } from "../../../adapters/Prisma/client";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import {
  buildRoute,
  generateGoogleMapsLink,
} from "../../../utils/generate-router-google";

type PropsGetRouter =
  | {
      numberLead: string;
      contactsWAOnAccountId: number;
      data: NodeGetRouterData;
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

export const NodeGetRouter = async (
  props: PropsGetRouter,
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
    const { nRouter, fields, ...restData } = props.data;

    if (!fields?.length) return "ok";

    const resolvercode = await resolveTextVariables({
      accountId: props.accountId,
      text: nRouter,
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      numberLead: props.numberLead,
      nodeId: props.nodeId,
    });

    const getRouter = await prisma.deliveryRouter.findFirst({
      where: { n_router: resolvercode },
      select: {
        id: true,
        status: true,
        ContactsWAOnAccount: {
          select: { ContactsWA: { select: { realNumber: true } } },
        },
        _count: {
          select: {
            DeliveryRouterOnOrders: true,
          },
        },
        menuOnline: {
          select: { MenuInfo: { select: { lat: true, lng: true } } },
        },
        DeliveryRouterOnOrders: {
          select: {
            Order: {
              select: {
                delivery_address: true,
                delivery_number: true,
                delivery_reference_point: true,
                delivery_complement: true,
                status: true,
                delivery_lat: true,
                delivery_lng: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!getRouter) return "not_found";

    if (fields.includes("status") && restData.varId_save_status) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_status, type: "dynamics" },
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
              value: getRouter.status || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: getRouter.status || "<empty>",
            },
          });
        }
      }
    }

    if (
      fields.includes("count_total_orders") &&
      restData.varId_save_count_total_orders
    ) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_count_total_orders, type: "dynamics" },
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
              value: String(getRouter._count.DeliveryRouterOnOrders),
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: String(getRouter._count.DeliveryRouterOnOrders),
            },
          });
        }
      }
    }

    if (
      fields.includes("number_contact") &&
      restData.varId_save_number_contact
    ) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_number_contact, type: "dynamics" },
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
              value:
                getRouter.ContactsWAOnAccount?.ContactsWA.realNumber?.replace(
                  /^55/,
                  "",
                ) || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value:
                getRouter.ContactsWAOnAccount?.ContactsWA.realNumber?.replace(
                  /^55/,
                  "",
                ) || "<empty>",
            },
          });
        }
      }
    }

    if (
      fields.includes("count_order_status_of") &&
      restData.varId_save_count_order_status_of &&
      restData.order_status_of
    ) {
      const exist = await prisma.variable.findFirst({
        where: {
          id: restData.varId_save_count_order_status_of,
          type: "dynamics",
        },
        select: { id: true },
      });

      if (exist) {
        const count = await prisma.orders
          .count({
            where: {
              status: restData.order_status_of as any,
              Router: { orderId: getRouter.id },
            },
          })
          .then((s) => s)
          .catch((_s) => 0);
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
              value: String(count),
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: String(count),
            },
          });
        }
      }
    }

    if (fields.includes("gain_total") && restData.varId_save_gain_total) {
      const exist = await prisma.variable.findFirst({
        where: {
          id: restData.varId_save_gain_total,
          type: "dynamics",
        },
        select: { id: true },
      });

      if (exist) {
        const count = await prisma.deliveryRouter.findFirst({
          where: { id: getRouter.id },
          select: {
            menuOnline: {
              select: { MenuInfo: { select: { delivery_fee: true } } },
            },
            _count: { select: { DeliveryRouterOnOrders: true } },
          },
        });
        const fee = count?.menuOnline.MenuInfo?.delivery_fee?.toNumber();
        if (!count || !fee) return "not_found";

        const totalgain = (fee * count._count.DeliveryRouterOnOrders).toFixed(
          2,
        );

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
              value: totalgain,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: totalgain,
            },
          });
        }
      }
    }

    if (fields.includes("link_router") && restData.varId_save_link_router) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_link_router, type: "dynamics" },
        select: { id: true },
      });

      let link: undefined | string = undefined;
      if (
        getRouter.menuOnline.MenuInfo?.lat &&
        getRouter.menuOnline.MenuInfo?.lng &&
        getRouter.DeliveryRouterOnOrders.length
      ) {
        const origin = {
          lat: getRouter.menuOnline.MenuInfo.lat,
          lng: getRouter.menuOnline.MenuInfo.lng,
        };
        const filterLatLng = getRouter.DeliveryRouterOnOrders.map((s) => {
          if (!s.Order.delivery_lat || !s.Order.delivery_lng) return;
          return {
            lat: s.Order.delivery_lat,
            lng: s.Order.delivery_lng,
          };
        }).filter((s) => s) as { lat: number; lng: number }[];

        const ordered = buildRoute(origin, filterLatLng);
        link = generateGoogleMapsLink(origin, ordered);
      }

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
              value: link || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: link || "<empty>",
            },
          });
        }
      }
    }

    if (
      fields.includes("link_router_updated") &&
      restData.varId_save_link_router_updated
    ) {
      const exist = await prisma.variable.findFirst({
        where: {
          id: restData.varId_save_link_router_updated,
          type: "dynamics",
        },
        select: { id: true },
      });

      let link: undefined | string = undefined;
      const ordersAcaminho = getRouter.DeliveryRouterOnOrders.filter(
        (s) => s.Order.status === "on_way",
      );
      if (
        getRouter.menuOnline.MenuInfo?.lat &&
        getRouter.menuOnline.MenuInfo?.lng &&
        ordersAcaminho.length
      ) {
        const origin = {
          lat: getRouter.menuOnline.MenuInfo.lat,
          lng: getRouter.menuOnline.MenuInfo.lng,
        };
        const filterLatLng = ordersAcaminho
          .map((s) => {
            if (!s.Order.delivery_lat || !s.Order.delivery_lng) return;
            return {
              lat: s.Order.delivery_lat,
              lng: s.Order.delivery_lng,
            };
          })
          .filter((s) => s) as { lat: number; lng: number }[];

        const ordered = buildRoute(origin, filterLatLng);
        link = generateGoogleMapsLink(origin, ordered, undefined, true);
      }

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
              value: link || "<empty>",
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: link || "<empty>",
            },
          });
        }
      }
    }

    if (fields.includes("data_text") && restData.varId_save_data_text) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_data_text, type: "dynamics" },
        select: { id: true },
      });

      let data_text = "";
      if (getRouter.ContactsWAOnAccount) {
        data_text = getRouter.DeliveryRouterOnOrders.map(
          (d, i) =>
            `${i + 1}. ${d.Order.name}\n${d.Order.delivery_address}, ${d.Order.delivery_number}\n*${d.Order.delivery_reference_point}*`,
        ).join("\n");
      }

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
              value: data_text,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: data_text,
            },
          });
        }
      }
    }

    if (
      fields.includes("link_join_router") &&
      restData.varId_save_link_join_router
    ) {
      const exist = await prisma.variable.findFirst({
        where: { id: restData.varId_save_link_join_router, type: "dynamics" },
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
        const link = `http://localhost:4001/v1/public/join-router/${resolvercode}?fsid=${props.flowStateId}&nl=`;
        if (!picked) {
          await prisma.contactsWAOnAccountVariable.create({
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              // value: `https://`,
              // pelo flowStateId tem o flowId
              // se o motoboy não tiver com um flowstate pro mesmo flowId então cria um como se fosse campanha.
              // manda para o node de "Rota foi aceita".
              value: link,
            },
          });
        } else {
          await prisma.contactsWAOnAccountVariable.update({
            where: { id: picked.id },
            data: {
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableId: exist.id,
              value: link,
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

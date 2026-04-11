import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetRouterOrdersDTO_I } from "./DTO";
import { formatToBRL, parseToNumber } from "brazilian-values";
import {
  buildRoute,
  generateGoogleMapsLink,
} from "../../utils/generate-router-google";

interface ItemDraft {
  title: string;
  price: Decimal | null;
  obs: string | null;
}

function formatOrder(itemsDraft: ItemDraft[]): Readonly<string> {
  const itemsText = itemsDraft
    .map((item) => {
      let header = `*${item.title}*`;
      const obs = item.obs ? `Obs: _${item.obs}_` : "";

      return [header, obs].filter(Boolean).join("\n");
    })
    .join("\n\n");

  return itemsText;
}

export class GetRouterOrdersUseCase {
  constructor() {}

  async run(dto: GetRouterOrdersDTO_I) {
    try {
      const getRouter = await prisma.deliveryRouter.findFirst({
        where: { n_router: dto.code },
        select: {
          menuOnline: {
            select: {
              titlePage: true,
              logoImg: true,
              MenuInfo: { select: { lat: true, lng: true } },
            },
          },
          status: true,
          ContactsWAOnAccount: {
            select: {
              ContactsWA: {
                select: { realNumber: true, completeNumber: true },
              },
            },
          },
          DeliveryRouterOnOrders: {
            select: {
              completedAt: true,
              Order: {
                select: {
                  data: true,
                  n_order: true,
                  name: true,
                  status: true,
                  Items: {
                    select: {
                      price: true,
                      title: true,
                      obs: true,
                    },
                  },
                  delivery_lat: true,
                  delivery_lng: true,
                  ContactsWAOnAccount: {
                    select: {
                      ContactsWA: { select: { realNumber: true, name: true } },
                    },
                  },
                  delivery_address: true,
                  delivery_cep: true,
                  delivery_complement: true,
                  delivery_number: true,
                  delivery_reference_point: true,
                  total: true,
                  payment_method: true,
                  payment_change_to: true,
                  Charges: {
                    select: {
                      status: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!getRouter) {
        throw new ErrorResponse(400).container("Rota não encontrada.");
      }

      if (
        getRouter.ContactsWAOnAccount?.ContactsWA.completeNumber &&
        !getRouter.ContactsWAOnAccount?.ContactsWA.completeNumber.startsWith(
          dto.nlid,
        )
      ) {
        // a rota é dele
        throw new ErrorResponse(400).container(
          "Rota atribuída a outro entregador.",
        );
      }

      let router_link: undefined | string = undefined;

      // @ts-expect-error
      let origin: { lat: number; lng: number } = {};
      let isMe: boolean = false;

      if (
        getRouter.menuOnline.MenuInfo?.lat &&
        getRouter.menuOnline.MenuInfo?.lng
      ) {
        if (getRouter.status === "in_progress") {
          isMe = true;
        } else {
          const orderAcaminho = getRouter.DeliveryRouterOnOrders.some(
            (s) => s.Order.status === "on_way",
          );
          if (getRouter.status !== "finished" && orderAcaminho) {
            isMe = true;
          } else {
            origin = {
              lat: getRouter.menuOnline.MenuInfo.lat,
              lng: getRouter.menuOnline.MenuInfo.lng,
            };
          }
        }

        const filterLatLng = getRouter.DeliveryRouterOnOrders.map((s) => {
          if (!s.Order.delivery_lat || !s.Order.delivery_lng) return;
          return {
            lat: s.Order.delivery_lat,
            lng: s.Order.delivery_lng,
          };
        }).filter((s) => s) as { lat: number; lng: number }[];

        const ordered = buildRoute(origin, filterLatLng);
        router_link = generateGoogleMapsLink(origin, ordered, undefined, isMe);
      }

      const nextItems = getRouter.DeliveryRouterOnOrders.map(
        ({ Order, completedAt }) => {
          const {
            ContactsWAOnAccount,
            data,
            Items,
            total,
            Charges,
            payment_change_to,
            ...order
          } = Order;
          const dataItems = formatOrder(Items);
          let nextData = dataItems;
          if (data) {
            nextData += `\n------\n${data}`;
          }

          return {
            data: nextData,
            ...order,
            total: total?.toNumber(),
            payment_change_to: payment_change_to
              ? isNaN(parseToNumber(payment_change_to))
                ? null
                : parseToNumber(payment_change_to)
              : null,
            charge_status: Charges.length ? Charges[0].status : undefined,
            completedAt,
            contact: ContactsWAOnAccount?.ContactsWA
              ? {
                  name: ContactsWAOnAccount?.ContactsWA.name,
                  number: ContactsWAOnAccount?.ContactsWA.realNumber,
                }
              : undefined,
          };
        },
      );

      return {
        status: 200,
        message: "OK!",
        router: {
          router_link,
          status: getRouter.status,
          menu: getRouter.menuOnline,
          orders: nextItems,
        },
      };
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new ErrorResponse(400).container(
        "Servidor não conseguiu resolver a Rota, error 500!",
      );
    }
  }
}

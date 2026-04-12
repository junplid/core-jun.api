import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineOrderDTO_I } from "./DTO";
import { genNumCode } from "../../utils/genNumCode";
import { NotificationApp } from "../../utils/notificationApp";
import { formatToBRL } from "brazilian-values";
import { OrderAdjustments } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { point, distance } from "@turf/turf";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

interface ItemDraft {
  id: number;
  obs?: string;
  title: string;
  qnt: number;
  price_un: number;
  sections: ({
    title: string | null;
    subItems: ({
      name: string;
      price_un: number;
      total: number;
      qnt: number;
    } | null)[];
  } | null)[];
}

function formatOrderTitle(item: { title: string; qnt: number }) {
  let header = `${item.qnt}x ${item.title}`;

  return header;
}

function formatOrderSections(
  sections: ({
    title: string | null;
    subItems: ({
      name: string;
      price_un: number;
      total: number;
      qnt: number;
    } | null)[];
  } | null)[],
) {
  const itemsText = (sections || [])
    .filter(Boolean)
    .map((section) => {
      const subs = (section?.subItems || [])
        .filter((s) => s)
        .map(
          (sub) =>
            `  • ${(sub?.qnt || 1) > 1 ? `${sub?.qnt}x` : ""} ${sub!.name} ${sub?.total ? `+${formatToBRL(sub.total)}` : ""}`,
        )
        .join("\n");

      if (!subs) return "";
      return `${section?.title || "Adicionais"}:\n${subs}`;
    })
    .join("\n");

  return itemsText;
}

export function isWithinDeliveryArea(
  store: { lng: number; lat: number; max_distance_km: number | null },
  customer: { lng: number; lat: number },
) {
  const from = point([store.lng, store.lat]);
  const to = point([customer.lng, customer.lat]);

  const km = distance(from, to, { units: "kilometers" });

  return {
    distanceKm: km,
    isInside: store.max_distance_km ? km <= store.max_distance_km : true,
  };
}

function formatOrder(
  itemsDraft: {
    title: string;
    obs: string | undefined;
    price: number;
    side_dishes: string;
  }[],
): Readonly<string> {
  const itemsText = itemsDraft
    .map((item) => {
      let header = item.title;
      if ((item.price || 0) > 0) {
        header += `  ${formatToBRL(item.price || 0)}`;
      }

      const obs = item.obs ? `Obs: _${item.obs}_` : "";

      return [header, item.side_dishes, obs].filter(Boolean).join("\n");
    })
    .join("\n\n");

  return itemsText;
}

export class CreateMenuOnlineOrderUseCase {
  constructor() {}

  async run({
    uuid,
    items,
    type_delivery,
    ...rest
  }: CreateMenuOnlineOrderDTO_I) {
    const exist = await prisma.menusOnline.findFirst({
      where: { uuid },
      select: {
        id: true,
        ConnectionWA: { select: { number: true, id: true, businessId: true } },
        accountId: true,
        MenuInfo: {
          select: {
            whatsapp_contact: true,
            delivery_fee: true,
            lat: true,
            lng: true,
            max_distance_km: true,
            price_per_km: true,
          },
        },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Cardápio digital não encontrado.",
      );
    }

    if (!exist.MenuInfo?.lat || !exist.MenuInfo.lng) {
      throw new ErrorResponse(400).container(
        "Cardápio digital não encontrado.",
      );
    }

    if (
      type_delivery === "enviar" &&
      (!rest.delivery_lat || !rest.delivery_lng)
    ) {
      throw new ErrorResponse(400).container(
        "Local de entrega PIN não encontrado.",
      );
    }

    const itemsDraft: ItemDraft[] = [];

    for await (const item of items) {
      const getItem = await prisma.menusOnlineItems.findFirst({
        where: { uuid: item.uuid, accountId: exist.accountId },
        select: {
          id: true,
          name: true,
          afterPrice: true,
          Sections: {
            select: {
              uuid: true,
              minOptions: true,
              maxOptions: true,
              title: true,
              SubItems: {
                select: {
                  after_additional_price: true,
                  name: true,
                  maxLength: true,
                  uuid: true,
                },
              },
            },
          },
        },
      });
      if (!getItem?.id) {
        throw new ErrorResponse(404).input({
          path: item.uuid,
          text: "Esse item não foi encontrado.",
        });
      }

      const sections = Object.entries(item.sections || {}).map(
        ([sectionUuid, objSub]) => {
          const section = getItem.Sections.find(
            (sec) => sec.uuid === sectionUuid,
          );
          if (!section) return null;

          return {
            title: section.title,
            subItems: Object.entries(objSub).map(([subUuid, value]) => {
              const subItem = section.SubItems.find(
                (subitem) => subitem.uuid === subUuid,
              );
              if (!subItem) return null;

              return {
                name: subItem.name,
                price_un: subItem.after_additional_price?.toNumber() || 0,
                total:
                  (subItem.after_additional_price?.toNumber() || 0) * value,
                qnt: value,
              };
            }),
          };
        },
      );

      itemsDraft.push({
        id: getItem.id,
        obs: item.obs,
        title: getItem.name,
        qnt: item.qnt,
        price_un: getItem.afterPrice?.toNumber() || 0,
        sections: sections,
      });
    }

    const total = itemsDraft.reduce((ac, cr) => {
      const tts = cr.sections?.reduce((actt, crtt) => {
        const tt2 =
          crtt?.subItems.reduce((actt2, crtt2) => {
            actt2 += crtt2?.total || 0;
            return actt2;
          }, 0) || 0;
        actt += tt2;
        return actt;
      }, 0);
      ac += (cr.price_un + tts) * cr.qnt;
      return ac;
    }, 0);

    //  let address_delivery = "";
    //  if (type_delivery === "enviar") {
    //    address_delivery = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    //      rest.delivery_address + " - " + rest.delivery_cep,
    //    )}`;
    //  }

    const numberwhats =
      exist.ConnectionWA?.number ||
      exist.MenuInfo?.whatsapp_contact?.replace(/\D/g, "");

    const orderAdjustments: Omit<OrderAdjustments, "id" | "orderId">[] = [];
    orderAdjustments.push({
      amount: new Decimal(0.08),
      label: "Taxa plataforma",
      type: "out",
    });

    /**
     * Total a pagar
     */
    let nextTotal = 0;
    if (type_delivery === "retirar") {
      nextTotal = total;
    } else {
      const deliveryArea = isWithinDeliveryArea(
        {
          lat: exist.MenuInfo.lat,
          lng: exist.MenuInfo.lng,
          max_distance_km: exist.MenuInfo.max_distance_km,
        },
        {
          lat: rest.delivery_lat!,
          lng: rest.delivery_lng!,
        },
      );

      if (!deliveryArea.isInside) {
        throw new ErrorResponse(400).container(
          "Ainda não entregamos nessa região 😕",
        );
      }

      const baseFee = exist.MenuInfo?.delivery_fee?.toNumber() || 0;
      const pricePerKm = exist.MenuInfo?.price_per_km?.toNumber() || 0;

      const adjustedKm = deliveryArea.distanceKm * 1.3;
      const deliveryFee = baseFee + adjustedKm * pricePerKm;

      if (deliveryFee > 0) {
        orderAdjustments.push({
          amount: new Decimal(deliveryFee),
          label: "Taxa de entrega",
          type: "in",
        });
      }
      nextTotal = total + deliveryFee;
    }

    const totalAdjustment = orderAdjustments.reduce((ac, cr) => {
      if (cr.type === "in") ac += cr.amount.toNumber();
      if (cr.type === "out") ac -= cr.amount.toNumber();
      return ac;
    }, 0);

    const net_total = totalAdjustment + total;

    try {
      const n_order = genNumCode(6);
      const tracking_code = genNumCode(4);

      const last = await prisma.orders.findFirst({
        where: {
          accountId: exist.accountId,
          status: "pending",
        },
        orderBy: { rank: "desc" },
        select: { rank: true },
      });

      const GAP = 640;
      const newRank = last ? last.rank.plus(GAP) : GAP;

      const nextItems = itemsDraft.map((ii) => {
        return {
          title: formatOrderTitle({
            title: ii.title,
            qnt: ii.qnt,
          }),
          itemId: ii.id,
          obs: ii.obs,
          price: ii.price_un,
          side_dishes: formatOrderSections(ii.sections),
        };
      });

      const { ContactsWAOnAccount, OrderAdjustments, Business, ...order } =
        await prisma.orders.create({
          data: {
            rank: newRank,
            n_order,
            tracking_code,
            accountId: exist.accountId,
            businessId: exist.ConnectionWA.businessId,
            connectionWAId: exist.ConnectionWA.id,
            itens_count: itemsDraft.length,
            name: rest.who_receives || null,
            isDragDisabled: false,
            menuId: exist.id,
            OrderAdjustments: { createMany: { data: orderAdjustments } },
            ...rest,
            net_total,
            delivery_address:
              rest.delivery_address || type_delivery.toUpperCase(),
            total: nextTotal,
            sub_total: total,
            status: "pending",
            // data: dataOrder,
            data: "",
            Items: { createMany: { data: nextItems } },
          },
          select: {
            id: true,
            createAt: true,
            OrderAdjustments: {
              select: { amount: true, label: true, type: true },
            },
            Business: { select: { name: true, id: true } },
            ContactsWAOnAccount: {
              select: {
                ContactsWA: {
                  select: { completeNumber: true, username: true },
                },
                Tickets: {
                  where: { status: { notIn: ["DELETED", "RESOLVED"] } },
                  select: {
                    ConnectionIg: { select: { ig_username: true } },
                    ConnectionWA: { select: { name: true, id: true } },
                    id: true,
                    InboxDepartment: { select: { name: true } },
                    status: true,
                    Messages: {
                      take: 1,
                      orderBy: { id: "desc" },
                      select: { by: true },
                    },
                  },
                },
              },
            },
          },
        });

      const first =
        itemsDraft.find((i) => i.sections?.length > 0) ?? itemsDraft[0];

      await NotificationApp({
        accountId: exist.accountId,
        title_txt: `${first.qnt}x ${first.title}...`,
        tag: `new-order-${n_order}`,
        title_html: `${first.qnt}x ${first.title}`,
        body_txt: `#${n_order}`,
        body_html: `<span className="font-medium text-sm line-clamp-1">Novo pedido</span><span className="text-xs font-light">#${n_order}</span>`,
        url_redirect: "/auth/orders",
        onFilterSocket: () => [],
      });

      const dataItems = formatOrder(nextItems);

      webSocketEmitToRoom()
        .account(exist.accountId)
        .orders.new_order(
          {
            ...order,
            name: rest.who_receives || null,
            n_order,
            net_total,
            businessId: Business.id,
            adjustments: OrderAdjustments,
            origin: "menu_online",
            delivery_address:
              rest.delivery_address || type_delivery.toUpperCase(),
            payment_method: rest.payment_method,
            payment_change_to: rest.payment_change_to,
            delivery_cep: rest.delivery_cep,
            delivery_complement: rest.delivery_complement,
            delivery_reference_point: rest.delivery_reference_point,
            delivery_number: rest.delivery_number,

            ...(rest.delivery_lat &&
              rest.delivery_lng &&
              exist.MenuInfo?.lat &&
              exist.MenuInfo?.lng && {
                link_map:
                  `https://www.google.com/maps/dir/?api=1` +
                  `&origin=${exist.MenuInfo?.lat},${exist.MenuInfo?.lng}` +
                  `&destination=${rest.delivery_lat},${rest.delivery_lng}`,
              }),
            status: "pending",
            data: dataItems,
            total: nextTotal,
            sequence: newRank,
            sub_total: total,
            isDragDisabled: false,
            ticket:
              ContactsWAOnAccount?.Tickets.map((tk) => {
                let connection: any = {};

                if (tk.ConnectionWA?.name) {
                  connection = {
                    s: !!cacheConnectionsWAOnline.get(tk.ConnectionWA?.id),
                    name: tk.ConnectionWA.name,
                    channel: "baileys",
                  };
                }
                if (tk.ConnectionIg?.ig_username) {
                  connection = {
                    s: true,
                    name: tk.ConnectionIg.ig_username,
                    channel: "instagram",
                  };
                }

                return {
                  connection,
                  id: tk.id,
                  //             // lastMessage: tk.Messages[0].by,
                  departmentName: tk.InboxDepartment.name,
                  status: tk.status,
                };
              }) || [],
          },
          [],
        );

      const redirectTo = `https://api.whatsapp.com/send?phone=${
        numberwhats
      }&text=${encodeURIComponent(`Confirmando meu pedido #${n_order}`)}`;

      return {
        message: "Pedido criado com sucesso.",
        status: 201,
        redirectTo,
      };
    } catch (error) {
      throw new ErrorResponse(400).container("Error ao tentar criar pedido.");
    }
  }
}

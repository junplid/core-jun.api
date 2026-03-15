import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineOrderDTO_I } from "./DTO";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { genNumCode } from "../../utils/genNumCode";
import { NotificationApp } from "../../utils/notificationApp";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { formatToBRL } from "brazilian-values";

interface ItemDraft {
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

function formatOrderWhatsapp(itemsDraft: ItemDraft[]) {
  const itemsText = itemsDraft
    .map((item) => {
      let header = `*${item.qnt}x ${item.title}*`;
      if (item.price_un > 0) {
        header += `\n${formatToBRL(item.price_un)}`;
      }

      const sections = (item.sections || [])
        .filter(Boolean)
        .map((section) => {
          const subs = (section?.subItems || [])
            .filter((s) => s)
            .map(
              (sub) =>
                `   • ${(sub?.qnt || 1) > 1 ? `${sub?.qnt}x` : ""} ${sub!.name} ${sub?.total ? `+${formatToBRL(sub.total)}` : ""}`,
            )
            .join("\n");

          if (!subs) return "";

          return `${section?.title || "Adicionais"}:\n${subs}`;
        })
        .filter(Boolean)
        .join("\n");

      const obs = item.obs ? `Obs: _${item.obs}_` : "";

      return [header, sections, obs].filter(Boolean).join("\n");
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
        MenuInfo: { select: { whatsapp_contact: true, delivery_fee: true } },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Cardápio digital não encontrado.",
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

    const nextTotal = total + (exist.MenuInfo?.delivery_fee?.toNumber() || 0);

    try {
      let dataOrder = "🔴 A confirmar\n\n";
      dataOrder += formatOrderWhatsapp(itemsDraft);
      const n_order = genNumCode(6);

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

      const { ContactsWAOnAccount, Business, ...order } =
        await prisma.orders.create({
          data: {
            rank: newRank,
            n_order,
            accountId: exist.accountId,
            businessId: exist.ConnectionWA.businessId,
            connectionWAId: exist.ConnectionWA.id,
            name: rest.who_receives || null,
            isDragDisabled: false,
            menuId: exist.id,
            ...rest,
            delivery_address:
              rest.delivery_address || type_delivery.toUpperCase(),
            total: nextTotal,
            status: "pending",
            data: dataOrder,
          },
          select: {
            id: true,
            createAt: true,
            priority: true,
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

      webSocketEmitToRoom()
        .account(exist.accountId)
        .orders.new_order(
          {
            ...order,
            name: rest.who_receives || null,
            n_order,
            businessId: Business.id,
            origin: "menu_online",
            delivery_address: rest.delivery_address,
            payment_method: rest.payment_method,
            payment_change_to: rest.payment_change_to,
            status: "pending",
            data: dataOrder,
            total: nextTotal,
            sequence: newRank,
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
                  // lastMessage: tk.Messages[0].by,
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

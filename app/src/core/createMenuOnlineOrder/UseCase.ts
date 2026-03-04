import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineOrderDTO_I } from "./DTO";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { genNumCode } from "../../utils/genNumCode";
import { NotificationApp } from "../../utils/notificationApp";
import { webSocketEmitToRoom } from "../../infra/websocket";

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
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Cardápio on-line não encontrado.",
      );
    }

    if (!cacheConnectionsWAOnline.get(exist.ConnectionWA.id)) {
      throw new ErrorResponse(400).container(
        "Conexão com o whatsapp indisponivel.",
      );
    }

    const prices: {
      name: string;
      qnt: number;
      flavors?: { name: string; qnt: number }[];
      price: number;
      obs?: string;
    }[] = [];

    for await (const item of items) {
      if (item.type === "drink") {
        const getItem = await prisma.menusOnlineItems.findFirst({
          where: {
            uuid: item.id,
            accountId: exist.accountId,
            menuId: exist.id,
            category: "drinks",
          },
          select: { afterPrice: true, name: true },
        });
        if (!getItem) {
          // retornar o uuid do item nao encontrado.
          console.log("item nao encontrado");
          return;
        }
        prices.push({
          name: getItem.name,
          price: getItem.afterPrice!.toNumber(),
          qnt: item.qnt,
          obs: item.obs,
        });
      }
      if (item.type === "pizza") {
        if (!item.flavors?.length) {
          console.log("Precisa selecionar os sabores da pizza");
          return;
        }
        const getItem = await prisma.sizesPizza.findFirst({
          where: { uuid: item.id, menuId: exist.id },
          select: { flavors: true, price: true, name: true },
        });
        if (!getItem) {
          // retornar o uuid do item nao encontrado.
          console.log("item nao encontrado");
          return;
        }
        const flavors: { name: string; qnt: number }[] = [];
        for await (const flavor of item.flavors || []) {
          const getflavor = await prisma.menusOnlineItems.findFirst({
            where: { uuid: flavor.id },
            select: { name: true },
          });
          if (!getflavor) {
            // retornar o uuid do item nao encontrado.
            console.log("Sabor não encontrado");
            return;
          }
          flavors.push({ name: getflavor.name, qnt: flavor.qnt });
        }
        prices.push({
          name: getItem.name,
          price: getItem.price.toNumber(),
          flavors,
          qnt: item.qnt,
          obs: item.obs,
        });
      }
    }

    const total = prices.reduce((ac, cr) => ac + cr.price * cr.qnt, 0);

    if (type_delivery === "enviar") {
      console.log({
        urlmap: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          rest.delivery_address + " - " + rest.delivery_cep,
        )}`,
      });
    }

    try {
      const dataOrder = prices
        .map((p) => {
          if (!p.flavors?.length) {
            return `${p.qnt} ${p.name}
${p.obs ? `OBS: ${p.obs}` : ""}`;
          } else {
            return `${p.qnt} Pizza ${p.name}:
${p.flavors.map((f) => `${f.name}(${f.qnt})`).join("\n")}
${p.obs ? `OBS: ${p.obs}` : ""}`;
          }
        })
        .join("\n");
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
            name: rest.who_receives || "Aguardando o nome...",
            isDragDisabled: false,
            menuId: exist.id,
            ...rest,
            total,
            status: "draft",
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

      await NotificationApp({
        accountId: exist.accountId,
        title_txt: `Novo pedido`,
        tag: `new-order-${n_order}`,
        title_html: `Novo pedido`,
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
            name: rest.who_receives || "Aguardando confirmação no WhatsApp",
            n_order,
            businessId: Business.id,
            origin: "Menu online",
            delivery_address: rest.delivery_address,
            payment_method: rest.payment_method,
            status: "draft",
            data: dataOrder,
            total,
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
        exist.ConnectionWA.number
      }&text=${encodeURIComponent(`Confirmando meu pedido ${n_order}`)}`;

      if (!cacheConnectionsWAOnline.get(exist.ConnectionWA.id)) {
        throw new ErrorResponse(400).container(
          "Conexão com o whatsapp indisponivel.",
        );
      }

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

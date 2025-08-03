import { remove } from "fs-extra";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineOrderDTO_I } from "./DTO";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { genNumCode } from "../../utils/genNumCode";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { socketIo } from "../../infra/express";

export class CreateMenuOnlineOrderUseCase {
  constructor() {}

  async run({ uuid, items, ...rest }: CreateMenuOnlineOrderDTO_I) {
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
        "Cardápio on-line não encontrado."
      );
    }

    if (!cacheConnectionsWAOnline.get(exist.ConnectionWA.id)) {
      throw new ErrorResponse(400).container(
        "Conexão com o whatsapp indisponivel."
      );
    }

    const prices: {
      name: string;
      qnt: number;
      flavors?: { name: string; qnt: number }[];
      price: number;
      obs?: string;
    }[] = [];
    // fazer os items e preço. para montar também o data do order;
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

    // console.log({
    //   urlmap: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    //     rest.delivery_address + " - " + rest.delivery_cep
    //   )}`,
    // });

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
      const order = await prisma.orders.create({
        data: {
          n_order,
          accountId: exist.accountId,
          businessId: exist.ConnectionWA.businessId,
          connectionWAId: exist.ConnectionWA.id,
          name: rest.who_receives,
          menuId: exist.id,
          ...rest,
          total,
          status: "draft",
          data: dataOrder,
        },
        select: { id: true, createAt: true, priority: true },
      });

      cacheAccountSocket.get(exist.accountId)?.listSocket?.forEach((sockId) => {
        socketIo.of(`/menu-${uuid}/orders`).emit("list", {
          accountId: exist.accountId,
          action: "new",
          order: {
            ...order,
            name: rest.who_receives,
            n_order,
            delivery_address: rest.delivery_address,
            payment_method: rest.payment_method,
            actionChannels: [],
            status: "draft",
            data: dataOrder,
            total,
          },
        });
      });

      const redirectTo = `https://api.whatsapp.com/send?phone=${
        exist.ConnectionWA.number
      }&text=${encodeURIComponent(n_order)}`;

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

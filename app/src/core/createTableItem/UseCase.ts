import { OrderAdjustments } from "@prisma/client";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateTableItemDTO_I } from "./DTO";
import { Decimal } from "@prisma/client/runtime/library";
import { genNumCode } from "../../utils/genNumCode";
import { formatToBRL } from "brazilian-values";

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

export class CreateTableItemUseCase {
  constructor() {}

  async run({ accountId, items, ...rest }: CreateTableItemDTO_I) {
    const exist = await prisma.table.findFirst({
      where: { id: rest.tableId, accountId },
      select: {
        id: true,
        name: true,
        Account: {
          select: {
            Business: { take: 1, select: { id: true } },
            MenuOnline: { take: 1, select: { id: true } },
          },
        },
        Order: {
          where: { status: "processing" },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!exist?.id || !exist.Account.Business.length) {
      throw new ErrorResponse(400).container("Mesa não encontrada.");
    }

    const itemsDraft: ItemDraft[] = [];
    for await (const item of items) {
      const getItem = await prisma.menusOnlineItems.findFirst({
        where: { uuid: item.uuid, accountId },
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

    const orderAdjustments: Omit<OrderAdjustments, "id" | "orderId">[] = [];
    orderAdjustments.push({
      amount: new Decimal(0.08),
      label: "Taxa plataforma",
      type: "out",
    });

    const n_order = genNumCode(6);
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

    try {
      if (exist.Order.length) {
        const newItems = await Promise.all(
          nextItems.map(async ({ itemId, ...nitem }) => {
            const item = await prisma.menuOnlineItemOfOrder.create({
              data: { ...nitem, itemId, orderId: exist.Order[0].id },
              select: { id: true },
            });

            return {
              ItemOfOrderId: item.id,
              ...nitem,
            };
          }),
        );
        return {
          status: 201,
          message: "OK",
          table: { items: newItems, id: rest.tableId, adjustments: [] },
        };
      } else {
        const order = await prisma.orders.create({
          data: {
            rank: 1,
            n_order,
            accountId,
            origin: "Presencial",
            menuId: exist.Account.MenuOnline[0].id,
            businessId: exist.Account.Business[0].id,
            name: `Mesa: ${exist.name}`,
            OrderAdjustments: { createMany: { data: orderAdjustments } },
            ...rest,
            status: "processing",
          },
          select: { id: true },
        });
        prisma.table
          .update({
            where: { id: exist.id },
            data: { status: "OCCUPIED" },
          })
          .then(undefined)
          .catch(undefined);
        const newItems = await Promise.all(
          nextItems.map(async ({ itemId, ...nitem }) => {
            const item = await prisma.menuOnlineItemOfOrder.create({
              data: { ...nitem, itemId, orderId: order.id },
              select: { id: true },
            });

            return {
              ItemOfOrderId: item.id,
              ...nitem,
            };
          }),
        );
        return {
          status: 201,
          message: "OK",
          table: {
            items: newItems,
            id: rest.tableId,
            adjustments: orderAdjustments.map((s) => ({
              amount: s.amount.toNumber(),
              label: s.label,
              type: s.type,
            })),
          },
        };
      }
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(500).toast({
        title: "Não foi possivel completar esta ação.",
        type: "error",
      });
    }
  }
}

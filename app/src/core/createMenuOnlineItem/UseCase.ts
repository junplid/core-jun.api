import { remove } from "fs-extra";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateMenuOnlineItemDTO_I } from "./DTO";

const optionsOperatingDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];

const daysMap = Object.fromEntries(
  optionsOperatingDays.map((d) => [d.value, d.label]),
);

function formatDays(days: number[]) {
  if (!days?.length) return "";

  const sorted = [...days].sort((a, b) => a - b);

  const isSequential = sorted.every((d, i) =>
    i === 0 ? true : d === sorted[i - 1] + 1,
  );

  if (isSequential && sorted.length > 1) {
    return `${daysMap[sorted[0]]} a ${daysMap[sorted[sorted.length - 1]]}`;
  }

  return sorted.map((d) => daysMap[d]).join(", ");
}

export class CreateMenuOnlineItemUseCase {
  constructor() {}

  async run({
    fileNameImage,
    uuid,
    sections,
    accountId,
    categoriesUuid,
    qnt = 9999,
    ...dto
  }: CreateMenuOnlineItemDTO_I) {
    // const getAccount = await prisma.account.findFirst({
    //   where: { id: dto.accountId },
    //   select: { isPremium: true },
    // });
    // if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");
    // if (!getAccount.isPremium) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Cardápios on-line exclusivos para usuários Premium.",
    //   });
    // }

    const menu = await prisma.menusOnline.findFirst({
      where: { accountId, uuid },
      select: { id: true },
    });

    if (!menu) {
      throw new ErrorResponse(400).input({
        text: "Cardápio não encontrado.",
        path: "uuid",
      });
    }

    if (!sections?.length && !dto.afterPrice) {
      throw new ErrorResponse(400).input({
        path: "afterPrice",
        text: "Campo obrigatório.",
      });
    }

    try {
      const item = await prisma.menusOnlineItems.create({
        data: {
          ...dto,
          qnt,
          accountId,
          beforePrice: dto.beforePrice ? Number(dto.beforePrice) : undefined,
          afterPrice: dto.afterPrice ? Number(dto.afterPrice) : undefined,
          img: fileNameImage,
          menuId: menu.id,
        },
        select: { id: true, uuid: true },
      });

      if (sections?.length) {
        for (let index = 0; index < sections.length; index++) {
          const { subItems, ...section } = sections[index];
          await prisma.menuOnlineItemSections.create({
            data: {
              sequence: index,
              itemId: item.id,
              ...section,
              minOptions: section.minOptions
                ? Number(section.minOptions)
                : undefined,
              maxOptions: section.maxOptions
                ? Number(section.maxOptions)
                : undefined,
              SubItems: {
                createMany: {
                  data: subItems.map(
                    (
                      {
                        after_additional_price,
                        before_additional_price,
                        ...item
                      },
                      indexsub,
                    ) => ({
                      ...item,
                      after_additional_price: after_additional_price
                        ? Number(after_additional_price)
                        : undefined,
                      before_additional_price: before_additional_price
                        ? Number(before_additional_price)
                        : undefined,
                      sequence: indexsub,
                    }),
                  ),
                },
              },
            },
            select: { id: true },
          });
        }
      }

      let getCategories: any[] = [];
      if (categoriesUuid?.length) {
        getCategories = await prisma.menuOnlineCategory.findMany({
          where: { uuid: { in: categoriesUuid } },
          select: {
            id: true,
            days_in_the_week: true,
            image45x45png: true,
            name: true,
          },
        });
        await prisma.menuOnlineCategoryOnMenusOnlineItems.createMany({
          data: getCategories.map((c) => ({
            itemId: item.id,
            categoryId: c.id,
          })),
        });
      }

      const valid = !sections?.some((s) => {
        if (s.minOptions) {
          return s.subItems.every((sb) => sb.maxLength === 0 || !sb.status);
        }
        return false;
      });

      const stateWarn = [];

      if (!qnt) {
        stateWarn.push("Estoque está 0(zero)");
      }
      if (!getCategories.length) {
        stateWarn.push("Sem categoria");
      }
      if (!valid) {
        const sectionIndex = sections?.findIndex(
          (s) =>
            s.minOptions &&
            s.subItems.every((sb) => sb.maxLength === 0 || !sb.status),
        );
        if (sectionIndex && sectionIndex > 0 && sections?.length) {
          const subs = sections[sectionIndex].subItems.map((s) => s.name);
          stateWarn.push(
            `"${sections[sectionIndex].title}" está com ${subs
              .join(", ")
              .replace(
                /,(?=[^,]*$)/,
                " e",
              )} desabilitado${subs.length > 1 ? "s" : ""}.`,
          );
        }
      }

      return {
        message: "Item criado com sucesso.",
        status: 201,
        item: {
          ...item,
          stateWarn,
          ...(sections?.length
            ? { view: valid && !!qnt && !!getCategories.length }
            : { view: !!qnt && !!getCategories.length }),
          categories: getCategories.map(({ days_in_the_week, ...ct }) => ({
            ...ct,
            days_in_the_week_label: formatDays(days_in_the_week),
          })),
        },
      };
    } catch (error) {
      let path = "";
      if (process.env.NODE_ENV === "production") {
        path = `../static/storage/`;
      } else {
        path = `../../../static/storage/`;
      }
      await remove(path + fileNameImage).catch((_err) => {
        console.log("Error ao remover arquivo: ");
      });
      if (sections?.length) {
        for (const section of sections) {
          for (const sub of section.subItems) {
            if (sub.image55x55png) {
              await remove(path + sub.image55x55png).catch((_err) => {
                console.log("Error ao remover arquivo: ");
              });
            }
          }
        }
      }
      throw new ErrorResponse(400).container(
        "Error ao tentar criar cardápio on-line.",
      );
    }
  }
}

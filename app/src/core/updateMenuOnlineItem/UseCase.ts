import { remove } from "fs-extra";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateMenuOnlineItemDTO_I } from "./DTO";
import { resolve } from "path";

const path = resolve(process.env.STORAGE_PATH!, "static", "storage");

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

export class UpdateMenuOnlineItemUseCase {
  constructor() {}

  async run({
    fileNameImage,
    uuid,
    itemUuid,
    sections,
    accountId,
    categoriesUuid,
    send_to_category_uuid,
    ...dto
  }: UpdateMenuOnlineItemDTO_I) {
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

    const getItem = await prisma.menusOnlineItems.findFirst({
      where: { uuid: itemUuid },
      select: {
        id: true,
        Sections: { select: { SubItems: { select: { image55x55png: true } } } },
      },
    });

    if (!getItem) {
      throw new ErrorResponse(400).toast({
        title: "Item não encontrado.",
        type: "error",
      });
    }

    if (sections !== undefined && !sections?.length && !dto.afterPrice) {
      throw new ErrorResponse(400).input({
        path: "afterPrice",
        text: "Campo obrigatório.",
      });
    }

    let send_to_categoryId: number | null | undefined = undefined;
    if (send_to_category_uuid === null) send_to_categoryId = null;
    if (send_to_category_uuid) {
      const targetCategory = await prisma.menuOnlineCategory.findFirst({
        where: { uuid: send_to_category_uuid, menuId: menu.id },
        select: { id: true },
      });
      if (!targetCategory?.id) {
        throw new ErrorResponse(400).input({
          path: "send_to_category_uuid",
          text: "Categoria não encontrada.",
        });
      }
      send_to_categoryId = targetCategory.id;
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        if (categoriesUuid) {
          const getCatdb =
            await tx.menuOnlineCategoryOnMenusOnlineItems.findMany({
              where: { itemId: getItem.id },
              select: { Category: { select: { uuid: true } } },
            });

          const catsDeleted = getCatdb.filter(
            (dbcats) => !categoriesUuid.includes(dbcats.Category.uuid),
          );
          if (catsDeleted.length) {
            await tx.menuOnlineCategoryOnMenusOnlineItems.deleteMany({
              where: {
                itemId: getItem.id,
                Category: {
                  uuid: { in: catsDeleted.map((s) => s.Category.uuid) },
                },
              },
            });
          }
          const catsNew = categoriesUuid.filter(
            (catsdto) =>
              !getCatdb.some((dtocats) => dtocats.Category.uuid === catsdto),
          );

          if (catsNew.length) {
            const getCat = await tx.menuOnlineCategory.findMany({
              where: { uuid: { in: catsNew } },
              select: { id: true },
            });
            await tx.menuOnlineCategoryOnMenusOnlineItems.createMany({
              data: getCat.map((c) => ({
                categoryId: c.id,
                itemId: getItem.id,
              })),
              skipDuplicates: true,
            });
          }
        }

        const getCategories =
          await tx.menuOnlineCategoryOnMenusOnlineItems.findMany({
            where: { itemId: getItem.id },
            select: {
              Category: {
                select: {
                  id: true,
                  days_in_the_week: true,
                  image45x45png: true,
                  name: true,
                },
              },
            },
          });

        const item = await tx.menusOnlineItems.update({
          where: { uuid: itemUuid },
          data: {
            ...dto,
            send_to_categoryId,
            ...(fileNameImage && { img: fileNameImage }),
          },
          select: {
            id: true,
            uuid: true,
            afterPrice: true,
            beforePrice: true,
            qnt: true,
            Sections: {
              select: {
                title: true,
                minOptions: true,
                SubItems: {
                  select: {
                    name: true,
                    status: true,
                    maxLength: true,
                  },
                },
              },
            },
          },
        });

        if (sections?.length) {
          const sectionsUuidDb = await tx.menuOnlineItemSections.findMany({
            where: { itemId: item.id },
            select: {
              uuid: true,
              SubItems: { select: { image55x55png: true } },
            },
          });

          const sectionsUuidDto = sections.map((s) => s.uuid);

          const sectionsDeleted = sectionsUuidDb.filter(
            (dbSection) => !sectionsUuidDto.includes(dbSection.uuid),
          );

          if (sectionsDeleted.length) {
            await tx.menuOnlineItemSections.deleteMany({
              where: { uuid: { in: sectionsDeleted.map((s) => s.uuid) } },
            });
          }

          const imgs = [
            ...sectionsDeleted
              .map((s) => s.SubItems.map((i) => i.image55x55png))
              .flat(),
          ];

          for await (const img of imgs) {
            if (img) {
              await remove(path + img).catch((_err) => {
                console.log("Error ao remover arquivo: ");
              });
            }
          }

          for (let index = 0; index < sections.length; index++) {
            const { subItems, uuid: sectionUuid, ...section } = sections[index];
            await tx.menuOnlineItemSections.upsert({
              where: { uuid: sectionUuid },
              create: {
                ...section,
                minOptions: section.minOptions
                  ? Number(section.minOptions)
                  : undefined,
                maxOptions: section.maxOptions
                  ? Number(section.maxOptions)
                  : undefined,
                uuid: sectionUuid,
                itemId: item.id,
                sequence: index,
              },
              update: {
                ...section,
                minOptions: section.minOptions
                  ? Number(section.minOptions)
                  : undefined,
                maxOptions: section.maxOptions
                  ? Number(section.maxOptions)
                  : undefined,
                sequence: index,
              },
            });

            const subItemsDb = await tx.menuOnlineItemSectionSubItems.findMany({
              where: { Section: { uuid: sectionUuid } },
              select: { uuid: true, image55x55png: true },
            });

            const subItemsUuidDto = subItems.map((s) => s.uuid);

            const subItemsDeleted = subItemsDb.filter(
              (dbSection) => !subItemsUuidDto.includes(dbSection.uuid),
            );

            if (subItemsDeleted.length) {
              await tx.menuOnlineItemSectionSubItems.deleteMany({
                where: { uuid: { in: sectionsDeleted.map((s) => s.uuid) } },
              });

              for await (const img of subItemsDeleted.map(
                (s) => s.image55x55png,
              )) {
                if (img) {
                  await remove(path + img).catch((_err) => {
                    console.log("Error ao remover arquivo: ");
                  });
                }
              }
            }

            for (let indexSub = 0; indexSub < subItems.length; indexSub++) {
              const sub = subItems[indexSub];

              const img = await tx.menuOnlineItemSectionSubItems.findFirst({
                where: { uuid: sub.uuid },
                select: { image55x55png: true },
              });
              if (img?.image55x55png !== sub.image55x55png) {
                await remove(path + sub.image55x55png).catch((_err) => {
                  console.log("Error ao remover arquivo: ");
                });
              }
              const { uuid: subuuid, ...rest } = sub;
              await tx.menuOnlineItemSectionSubItems.upsert({
                where: { uuid: subuuid },
                create: {
                  ...rest,
                  Section: { connect: { uuid: sectionUuid } },
                  sequence: indexSub,
                },
                update: {
                  ...rest,
                  sequence: indexSub,
                },
              });
            }
          }
        }

        const valid = !item.Sections.some((s) => {
          if (s.minOptions) {
            return s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status);
          }
          return false;
        });

        const stateWarn = [];

        if (!item.qnt) {
          stateWarn.push("Desativado");
        }
        if (!getCategories.length) {
          stateWarn.push("Sem categoria");
        }
        if (!valid) {
          const sectionIndex = item.Sections.findIndex(
            (s) =>
              s.minOptions &&
              s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status),
          );
          const subs = item.Sections[sectionIndex].SubItems.map((s) => s.name);
          stateWarn.push(
            `"${item.Sections[sectionIndex].title}" está com ${subs
              .join(", ")
              .replace(
                /,(?=[^,]*$)/,
                " e",
              )} desabilitado${subs.length > 1 ? "s" : ""}.`,
          );
        }

        return {
          ...item,
          stateWarn,
          ...(item.Sections.length
            ? { view: valid && !!item.qnt && !!getCategories.length }
            : { view: !!item.qnt && !!getCategories.length }),
          categories: getCategories.map(
            ({ Category: { days_in_the_week, ...ct } }) => ({
              ...ct,
              days_in_the_week_label: formatDays(days_in_the_week),
            }),
          ),
        };
      });

      return {
        message: "Item atualizado com sucesso.",
        status: 201,
        item: result,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new ErrorResponse(400).container("Error ao tentar atualizar item.");
    }
  }
}

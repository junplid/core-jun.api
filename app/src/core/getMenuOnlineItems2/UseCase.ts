import { GetMenuOnlineItems2DTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import moment from "moment-timezone";

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

export class GetMenuOnlineItems2UseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineItems2DTO_I) {
    const categories = await prisma.menuOnlineCategory.findMany({
      orderBy: { sequence: "asc" },
      where: {
        Menu: { uuid: dto.uuid, accountId },
        Items: { some: {} },
      },
      select: {
        name: true,
        id: true,
        uuid: true,
        days_in_the_week: true,
        Items: {
          select: {
            Item: {
              select: {
                id: true,
                desc: true,
                name: true,
                afterPrice: true,
                beforePrice: true,
                img: true,
                uuid: true,
                qnt: true,
                date_validity: true,
                Sections: {
                  orderBy: { sequence: "asc" },
                  select: {
                    title: true,
                    maxOptions: true,
                    minOptions: true,
                    SubItems: {
                      orderBy: { sequence: "asc" },
                      select: {
                        status: true,
                        name: true,
                        maxLength: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },

        image45x45png: true,
      },
    });

    const get_items_without_category = await prisma.menusOnlineItems.findMany({
      where: { Categories: { none: {} } },
      select: {
        id: true,
        desc: true,
        name: true,
        afterPrice: true,
        beforePrice: true,
        img: true,
        uuid: true,
        qnt: true,
        date_validity: true,
        Sections: {
          orderBy: { sequence: "asc" },
          select: {
            title: true,
            maxOptions: true,
            minOptions: true,
            SubItems: {
              orderBy: { sequence: "asc" },
              select: {
                status: true,
                name: true,
                maxLength: true,
              },
            },
          },
        },
      },
    });

    const items_without_category = get_items_without_category.map(
      ({ Sections, ...c }) => {
        const valid = !Sections.some((s) => {
          if (s.minOptions) {
            return s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status);
          }
          return false;
        });

        const stateWarn = [];

        if (c.date_validity) {
          const today = moment().startOf("day");
          const validityDate = moment(c.date_validity).startOf("day");
          if (validityDate.isBefore(today)) {
            stateWarn.push(
              `Produto vencido. ${validityDate.format("DD/MM/YYYY")}`,
            );
          }
        }
        if (!c.qnt) {
          stateWarn.push("Desativado");
        }
        if (!valid) {
          const sectionIndex = Sections.findIndex(
            (s) =>
              s.minOptions &&
              s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status),
          );
          const subs = Sections[sectionIndex].SubItems.map((s) => s.name);
          stateWarn.push(
            `"${Sections[sectionIndex].title}" está com ${subs
              .join(", ")
              .replace(
                /,(?=[^,]*$)/,
                " e",
              )} desabilitado${subs.length > 1 ? "s" : ""}.`,
          );
        }

        return {
          ...c,
          stateWarn,
          afterPrice: c.afterPrice?.toNumber(),
          beforePrice: c.beforePrice?.toNumber(),
          ...(Sections.length ? { view: valid && !!c.qnt } : { view: !!c.qnt }),
          ...(stateWarn.length && { view: false }),
          isSections: !!Sections.length,
        };
      },
    );

    const items_with_category = categories.map(
      ({ Items, days_in_the_week, ...category }) => {
        const items = Items.map(({ Item: { Sections, ...c } }) => {
          const valid = !Sections.some((s) => {
            if (s.minOptions) {
              return s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status);
            }
            return false;
          });

          const stateWarn = [];

          if (c.date_validity) {
            const today = moment().startOf("day");
            const validityDate = moment(c.date_validity).startOf("day");
            if (validityDate.isBefore(today)) {
              stateWarn.push(
                `Produto vencido. ${validityDate.format("DD/MM/YYYY")}`,
              );
            }
          }
          if (!c.qnt) {
            stateWarn.push("Desativado");
          }
          if (!valid) {
            const sectionIndex = Sections.findIndex(
              (s) =>
                s.minOptions &&
                s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status),
            );
            const subs = Sections[sectionIndex].SubItems.map((s) => s.name);
            stateWarn.push(
              `"${Sections[sectionIndex].title}" está com ${subs
                .join(", ")
                .replace(
                  /,(?=[^,]*$)/,
                  " e",
                )} desabilitado${subs.length > 1 ? "s" : ""}.`,
            );
          }

          return {
            ...c,
            stateWarn,
            afterPrice: c.afterPrice?.toNumber(),
            beforePrice: c.beforePrice?.toNumber(),
            ...(Sections.length
              ? { view: valid && !!c.qnt }
              : { view: !!c.qnt }),
            ...(stateWarn.length && { view: false }),
            isSections: !!Sections.length,
          };
        });

        return {
          ...category,
          days_in_the_week_label: formatDays(days_in_the_week),
          items,
        };
      },
    );

    return {
      message: "OK!",
      status: 200,
      data: {
        items_with_category,
        items_without_category,
      },
    };
  }
}

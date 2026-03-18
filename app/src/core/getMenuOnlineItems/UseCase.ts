import { GetMenuOnlineItemsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

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

export class GetMenuOnlineItemsUseCase {
  constructor() {}

  async run({ accountId, ...dto }: GetMenuOnlineItemsDTO_I) {
    const items = await prisma.menusOnlineItems.findMany({
      orderBy: { createAt: "desc" },
      where: { accountId, Menu: { uuid: dto.uuid } },
      select: {
        id: true,
        desc: true,
        name: true,
        afterPrice: true,
        beforePrice: true,
        img: true,
        uuid: true,
        qnt: true,
        Categories: {
          select: {
            Category: {
              select: {
                name: true,
                id: true,
                days_in_the_week: true,
                image45x45png: true,
              },
            },
          },
        },
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

    const formatted = items.map(({ Categories, Sections, ...c }) => {
      const valid = !Sections.some((s) => {
        if (s.minOptions) {
          return s.SubItems.every((sb) => sb.maxLength === 0 || !sb.status);
        }
        return false;
      });

      const stateWarn = [];

      if (!c.qnt) {
        stateWarn.push("Estoque está 0(zero)");
      }
      if (!Categories.length) {
        stateWarn.push("Sem categoria");
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
        ...(Sections.length
          ? { view: valid && !!c.qnt && !!Categories.length }
          : { view: !!c.qnt && !!Categories.length }),
        categories: Categories.map(
          ({ Category: { days_in_the_week, ...cat } }) => ({
            ...cat,
            days_in_the_week_label: formatDays(days_in_the_week),
          }),
        ),
      };
    });

    formatted.sort((a, b) => {
      return (a.stateWarn?.length ?? 0) - (b.stateWarn?.length ?? 0);
    });

    return {
      message: "OK!",
      status: 200,
      items: formatted,
    };
  }
}

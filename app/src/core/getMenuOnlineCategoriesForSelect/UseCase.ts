import { GetMenuOnlineCategoriesForSelectDTO_I } from "./DTO";
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

export class GetMenuOnlineCategoriesForSelectUseCase {
  constructor() {}

  async run(dto: GetMenuOnlineCategoriesForSelectDTO_I) {
    const categories = await prisma.menuOnlineCategory.findMany({
      where: {
        Menu: dto,
      },
      orderBy: { id: "desc" },
      select: {
        name: true,
        id: true,
        uuid: true,
        image45x45png: true,
        days_in_the_week: true,
      },
    });

    const formatted = categories.map(({ days_in_the_week, ...c }) => ({
      ...c,
      days_in_the_week_label: formatDays(days_in_the_week),
    }));

    return {
      message: "OK!",
      status: 200,
      categories: formatted,
    };
  }
}

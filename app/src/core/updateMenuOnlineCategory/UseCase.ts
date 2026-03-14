import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateMenuOnlineCategoryDTO_I } from "./DTO";

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

export class UpdateMenuOnlineCategoryUseCase {
  constructor() {}

  async run({
    uuid,
    accountId,
    categoryUuid,
    ...dto
  }: UpdateMenuOnlineCategoryDTO_I) {
    // const getAccount = await prisma.account.findFirst({
    //   where: { id: accountId },
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

    const category = await prisma.menuOnlineCategory.findFirst({
      orderBy: { sequence: "desc" },
      where: { menuId: menu.id, uuid: categoryUuid },
      select: { id: true, sequence: true },
    });

    if (!category) {
      throw new ErrorResponse(400).input({
        text: "Categoria não encontrada.",
        path: "root",
      });
    }

    try {
      await prisma.menuOnlineCategory.update({
        where: { id: category.id },
        data: { ...dto, sequence: category.sequence || 0 },
      });

      return {
        message: "Categoria atualizada com sucesso.",
        status: 201,
        category: {
          image45x45png: dto.image45x45png,
          days_in_the_week_label: formatDays(dto.days_in_the_week || []),
        },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).container("Error ao tentar criar tamanho.");
    }
  }
}

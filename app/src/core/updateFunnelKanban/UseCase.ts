import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateFunnelKanbanADMDTO_I } from "./DTO";

export class UpdateFunnelKanbanADMUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateFunnelKanbanADMDTO_I) {
    const isExist = await prisma.funnelKanban.findFirst({
      where: { accountId, id },
    });

    if (!isExist) {
      throw new ErrorResponse(400).toast({
        title: `Funil kanban não foi encontrado`,
        type: "error",
      });
    }

    const kanban = await prisma.funnelKanban.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.businessId && { businessId: dto.businessId }),
      },
      select: { Business: { select: { name: true } } },
    });

    const { Business } = kanban;

    if (dto.columns?.length) {
      for await (const column of dto.columns) {
        if (column.isDelete) {
          await prisma.stepsFunnelKanban.delete({
            where: { id: column.id, funnelKanbanId: id, accountId },
          });
        } else {
          const { isDelete, id: idCol, ...col } = column;
          if (idCol) {
            await prisma.stepsFunnelKanban.update({
              where: { id: idCol, funnelKanbanId: id, accountId },
              data: {
                ...(col.name && { name: col.name }),
                ...(col.color && { color: col.color }),
                ...(col.sequence && { sequence: col.sequence }),
              },
            });
          } else {
            await prisma.stepsFunnelKanban.create({
              data: {
                funnelKanbanId: id,
                accountId,
                name: col.name!,
                sequence: col.sequence!,
                color: col.color!,
              },
            });
          }
        }
      }
    }

    return { message: "OK!", status: 200, kanban: { business: Business.name } };
  }
}

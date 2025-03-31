import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneFunnelKanbanWaDTO_I } from "./DTO";

export class CreateCloneFunnelKanbanWaUseCase {
  constructor() {}

  async run({ accountId, id: idOrigin }: CreateCloneFunnelKanbanWaDTO_I) {
    const exist = await prisma.funnelKanban.findFirst({
      where: { id: idOrigin, accountId },
      select: {
        id: true,
        name: true,
        Business: { select: { name: true, id: true } },
        StepsFunnelKanban: true,
      },
    });

    if (!exist?.id) {
      throw new ErrorResponse(400).toast({
        title: "Funil kanban não encontrado",
        type: "error",
      });
    }

    const { id, name, ...rest } = exist;

    const { Business, ...nextConnection } = await prisma.funnelKanban.create({
      data: {
        accountId,
        businessId: rest.Business.id,
        name: name + "_COPIA_" + new Date().getTime(),
        ...(rest.StepsFunnelKanban.length && {
          StepsFunnelKanban: {
            createMany: {
              data: rest.StepsFunnelKanban.map(
                ({ id, funnelKanbanId, ...r }) => r
              ),
            },
          },
        }),
      },
      select: {
        name: true,
        id: true,
        createAt: true,
        Business: { select: { name: true } },
      },
    });

    return {
      message: "OK!",
      status: 200,
      kanban: { ...nextConnection, business: Business.name },
    };
  }
}

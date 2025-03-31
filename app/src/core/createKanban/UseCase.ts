import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateKanbanDTO_I } from "./DTO";
import { CreateKanbanRepository_I } from "./Repository";

export class CreateKanbanUseCase {
  constructor(private repository: CreateKanbanRepository_I) {}

  async run({ columns, ...dto }: CreateKanbanDTO_I) {
    const exist = await prisma.funnelKanban.findFirst({
      where: { accountId: dto.accountId, name: dto.name },
      select: { id: true },
    });

    if (exist?.id) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe kanban com esse nome`,
      });
    }

    const { Business, ...kanban } = await prisma.funnelKanban.create({
      data: {
        accountId: dto.accountId,
        businessId: dto.businessId,
        name: dto.name,
        StepsFunnelKanban: {
          createMany: {
            data: columns.map((col) => ({ accountId: dto.accountId, ...col })),
          },
        },
      },
      select: {
        id: true,
        Business: { select: { name: true } },
        createAt: true,
      },
    });

    return {
      message: "Funil criado com sucesso!",
      status: 201,
      kanban: {
        ...kanban,
        business: Business.name,
      },
    };
  }
}

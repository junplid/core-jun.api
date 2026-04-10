import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CompleteRouterDTO_I } from "./DTO";

export class CompleteRouterUseCase {
  constructor() {}

  async run(dto: CompleteRouterDTO_I) {
    const getRouter = await prisma.deliveryRouter.findFirst({
      where: {
        n_router: dto.code,
        ContactsWAOnAccount: { ContactsWA: { completeNumber: dto.nlid } },
        status: "in_progress",
      },
      select: {
        status: true,
        id: true,
      },
    });

    if (!getRouter) {
      throw new ErrorResponse(400).toast({
        title: "Rota não encontrada.",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    if (getRouter.status === "finished") {
      throw new ErrorResponse(400).toast({
        title: "Rota está finalizada",
        description: "Esta ação não pôde ser concluída.",
        placement: "bottom",
        type: "error",
      });
    }

    await prisma.deliveryRouter.update({
      where: { id: getRouter.id },
      data: { status: "finished" },
    });

    return {
      status: 200,
      message: "OK!",
      router: { status: "finished" },
    };
  }
}

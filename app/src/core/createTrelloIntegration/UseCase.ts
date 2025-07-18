import { CreateTrelloIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateTrelloIntegrationUseCase {
  constructor() {}

  async run({ accountId, ...dto }: CreateTrelloIntegrationDTO_I) {
    const isPremium = await prisma.account.findFirst({
      where: { id: accountId, isPremium: true },
    });
    if (!isPremium) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Integrações de trello — exclusivos para usuários Premium.",
      });
    }

    const exist = await prisma.trelloIntegration.findFirst({
      where: { accountId, name: dto.name },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe uma integração com esse nome`,
      });
    }

    try {
      const integration = await prisma.trelloIntegration.create({
        data: { ...dto, accountId },
        select: { id: true, createAt: true },
      });

      return { status: 201, integration };
    } catch (error) {
      console.error("Erro ao criar integração pagamento.", error);
      throw new ErrorResponse(500).container(
        "Erro ao tentar criar integração de pagamento."
      );
    }
  }
}

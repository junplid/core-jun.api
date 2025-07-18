import { GetTrelloIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetTrelloIntegrationUseCase {
  constructor() {}

  async run(dto: GetTrelloIntegrationDTO_I) {
    const integration = await prisma.trelloIntegration.findFirst({
      where: dto,
      select: { name: true, key: true, status: true },
    });

    if (!integration) {
      throw new ErrorResponse(404).container(
        "Integração do trello não encontrada."
      );
    }

    return { message: "OK!", status: 200, integration };
  }
}

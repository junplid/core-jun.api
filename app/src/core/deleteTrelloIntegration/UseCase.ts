import { DeleteTrelloIntegrationDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteTrelloIntegrationUseCase {
  constructor() {}

  async run(dto: DeleteTrelloIntegrationDTO_I) {
    const exist = await prisma.trelloIntegration.count({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Integração trello não encontrada`,
        type: "error",
      });
    }

    await prisma.trelloIntegration.delete({ where: dto });

    return { message: "OK!", status: 200 };
  }
}

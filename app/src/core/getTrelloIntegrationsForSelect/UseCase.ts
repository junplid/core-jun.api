import { GetTrelloIntegrationsForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetTrelloIntegrationsForSelectUseCase {
  constructor() {}

  async run({
    accountId,
    page = 1,
    ...dto
  }: GetTrelloIntegrationsForSelectDTO_I) {
    // const pageSize = 15;
    // const skip = (page - 1) * pageSize;

    const integrations = await prisma.trelloIntegration.findMany({
      orderBy: { createAt: "desc" },
      where: {
        accountId,
        ...(dto.name && { name: { contains: dto.name, mode: "insensitive" } }),
      },
      select: { id: true, name: true, status: true },
      // take: pageSize,
      // skip,
    });

    return {
      message: "OK!",
      status: 200,
      integrations,
    };
  }
}

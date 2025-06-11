import { GetProvidersForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetProvidersForSelectUseCase {
  constructor() {}

  async run(dto: GetProvidersForSelectDTO_I) {
    const providers = await prisma.providerCredential.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: { id: true, label: true },
    });

    return {
      message: "OK!",
      status: 200,
      providers: providers.map((provider) => ({
        id: provider.id,
        name: provider.label,
      })),
    };
  }
}

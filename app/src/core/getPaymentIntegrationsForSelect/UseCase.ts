import { GetPaymentIntegrationsForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetPaymentIntegrationsForSelectUseCase {
  constructor() {}

  async run({
    accountId,
    page = 1,
    ...dto
  }: GetPaymentIntegrationsForSelectDTO_I) {
    // const pageSize = 15;
    // const skip = (page - 1) * pageSize;

    const integrations = await prisma.paymentIntegrations.findMany({
      orderBy: { createAt: "desc" },
      where: {
        accountId,
        ...(dto.name && { name: { contains: dto.name, mode: "insensitive" } }),
        ...(dto.provider && { provider: dto.provider }),
      },
      select: { id: true, name: true, provider: true, status: true },
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

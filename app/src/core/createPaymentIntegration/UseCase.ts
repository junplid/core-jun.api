import { CreatePaymentIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreatePaymentIntegrationUseCase {
  constructor() {}

  async run({ accountId, ...dto }: CreatePaymentIntegrationDTO_I) {
    // const isPremium = await prisma.account.findFirst({
    //   where: { id: accountId, isPremium: true },
    // });
    // if (!isPremium) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Integrações de pagamento — exclusivos para usuários Premium.",
    //   });
    // }

    const exist = await prisma.paymentIntegrations.findFirst({
      where: { accountId, name: dto.name, provider: dto.provider },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe uma integração com esse nome para: ${dto.provider}`,
      });
    }

    try {
      const integration = await prisma.paymentIntegrations.create({
        data: { ...dto, accountId },
        select: { id: true, createAt: true },
      });

      return {
        status: 201,
        integration,
      };
    } catch (error) {
      console.error("Erro ao criar integração pagamento.", error);
      throw new ErrorResponse(500).container(
        "Erro ao tentar criar integração de pagamento.",
      );
    }
  }
}

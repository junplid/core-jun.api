import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdatePaymentIntegrationDTO_I } from "./DTO";

export class UpdatePaymentIntegrationUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdatePaymentIntegrationDTO_I) {
    const exist = await prisma.paymentIntegrations.findFirst({
      where: { accountId, id },
      select: { id: true, provider: true },
    });
    if (!exist) {
      throw new ErrorResponse(400).container(
        "Integração de pagamento não encontrada!",
      );
    }

    if (dto.name) {
      const existName = await prisma.paymentIntegrations.findFirst({
        where: {
          accountId,
          id: { not: id },
          name: dto.name,
          provider: exist.provider,
        },
        select: { id: true },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          path: "name",
          text:
            "Já existe uma integração com esse nome para: " + exist.provider ||
            exist.provider,
        });
      }
    }

    await prisma.paymentIntegrations.update({
      where: { id, accountId },
      data: dto,
    });

    return { message: "OK.", status: 200 };
  }
}

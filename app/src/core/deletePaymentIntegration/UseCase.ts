import { DeletePaymentIntegrationDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { encrypt } from "../../libs/encryption";

export class DeletePaymentIntegrationUseCase {
  constructor() {}

  async run(dto: DeletePaymentIntegrationDTO_I) {
    const connection = await prisma.paymentIntegrations.findFirst({
      where: dto,
      select: { id: true },
    });

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title: "Integração de pagamento não encontrada.",
        type: "error",
      });
    }

    // re-escreve as credenciais com lixo
    const nextCreds = encrypt({ revoked: true });
    await prisma.paymentIntegrations.update({
      where: dto,
      data: { deleted: true, credentials: nextCreds },
    });

    return { message: "OK!", status: 200 };
  }
}

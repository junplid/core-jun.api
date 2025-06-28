import { DeletePaymentIntegrationDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

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

    await prisma.paymentIntegrations.delete({ where: dto });

    return {
      message: "OK!",
      status: 200,
    };
  }
}

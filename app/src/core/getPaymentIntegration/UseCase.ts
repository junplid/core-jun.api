import { GetPaymentIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetPaymentIntegrationUseCase {
  constructor() {}

  async run(dto: GetPaymentIntegrationDTO_I) {
    const integration = await prisma.paymentIntegrations.findFirst({
      where: dto,
      select: { name: true, provider: true, status: true },
    });

    if (!integration) {
      throw new ErrorResponse(404).container(
        "Integração de pagamento não encontrada."
      );
    }

    return { message: "OK!", status: 200, integration };
  }
}

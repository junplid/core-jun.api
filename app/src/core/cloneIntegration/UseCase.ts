import { CloneIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneIntegrationUseCase {
  constructor() {}

  async run(dto: CloneIntegrationDTO_I) {
    const integration = await prisma.integrations.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        type: true,
        token: true,
        key: true,
      },
    });

    if (!integration) {
      throw new ErrorResponse(400).toast({
        title: "Serviço não encontrado",
        type: "error",
      });
    }

    const name = `COPIA_${new Date().getTime()}_${integration.name}`;

    const { id, createAt } = await prisma.integrations.create({
      data: {
        ...integration,
        name,
        accountId: dto.accountId,
      },
      select: { id: true, createAt: true },
    });

    return {
      message: "Serviço clonado com sucesso!",
      status: 200,
      integration: {
        id,
        name,
        createAt,
        type: integration.type,
        token: integration.token,
        key: integration.key,
      },
    };
  }
}

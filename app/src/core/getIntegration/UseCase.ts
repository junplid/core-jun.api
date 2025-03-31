import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetIntegrationDTO_I } from "./DTO";

export class GetIntegrationUseCase {
  constructor() {}

  async run(dto: GetIntegrationDTO_I) {
    const integration = await prisma.integrations.findUnique({
      where: dto,
      select: {
        name: true,
        key: true,
        token: true,
        type: true,
      },
    });

    if (!integration) {
      throw new ErrorResponse(400).toast({
        title: ` Integração não foi encontrada`,
        type: "error",
      });
    }

    return {
      message: "OK!",
      status: 200,
      integration,
    };
  }
}

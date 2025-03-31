import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetIntegrationDetailsDTO_I } from "./DTO";

export class GetIntegrationDetailsUseCase {
  constructor() {}

  async run(dto: GetIntegrationDetailsDTO_I) {
    const integration = await prisma.integrations.findUnique({
      where: dto,
      select: {
        id: true,
        key: true,
        type: true,
        name: true,
        token: true,
        createAt: true,
        updateAt: true,
      },
    });

    if (!integration) {
      throw new ErrorResponse(400).toast({
        title: `Integração não foi encontrada`,
        type: "error",
      });
    }

    return { message: "OK!", status: 200, integration };
  }
}

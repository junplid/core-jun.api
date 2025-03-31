import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateIntegrationDTO_I } from "./DTO";

export class UpdateIntegrationUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateIntegrationDTO_I) {
    const exist = await prisma.integrations.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Serviço não foi encontrado`,
        type: "error",
      });
    }

    try {
      await prisma.integrations.update({
        where: { id },
        data: dto,
      });

      return { message: "OK!", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Serviço`,
        type: "error",
      });
    }
  }
}

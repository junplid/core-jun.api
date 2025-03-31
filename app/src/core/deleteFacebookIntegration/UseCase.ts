import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteFacebookIntegrationDTO_I } from "./DTO";

export class DeleteFacebookIntegrationUseCase {
  constructor() {}

  async run(dto: DeleteFacebookIntegrationDTO_I) {
    const exist = await prisma.facebookIntegration.findFirst({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Integração facebook não foi encontrada`,
        type: "error",
      });
    }

    await prisma.facebookIntegration.delete({ where: dto });

    return { message: "OK!", status: 200 };
  }
}

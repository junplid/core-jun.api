import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { DeleteContactOnCampaignAudienceDTO_I } from "./DTO";

export class DeleteContactOnCampaignAudienceUseCase {
  constructor() {}

  async run(dto: DeleteContactOnCampaignAudienceDTO_I) {
    try {
      const target = await prisma.contactsWAOnAccountOnAudience.findFirst({
        where: {
          contactWAOnAccountId: dto.id,
          Audience: { accountId: dto.accountId, id: dto.audienceId },
        },
        select: { id: true },
      });

      if (target) {
        await prisma.contactsWAOnAccountOnAudience.delete({
          where: { id: target.id },
        });
      }

      return { message: "OK", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Não foi possivel remover contato do público`,
        type: "error",
      });
    }
  }
}

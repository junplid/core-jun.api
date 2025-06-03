import { DeleteCampaignDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class DeleteCampaignUseCase {
  constructor() {}

  async run(dto: DeleteCampaignDTO_I) {
    const findCampaigns = await prisma.campaign.findFirst({
      where: dto,
      select: { id: true },
    });
    if (!findCampaigns) {
      throw new ErrorResponse(400).container("Campanha não encontrada!");
    }

    await prisma.campaign.delete({ where: dto });
    return { message: "OK!", status: 200 };
  }
}

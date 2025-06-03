import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateCampaignDTO_I } from "./DTO";

export class UpdateCampaignUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateCampaignDTO_I) {
    const exist = await prisma.campaign.findFirst({
      where: { accountId, id },
      select: { id: true },
    });
    if (!exist) {
      throw new ErrorResponse(400).container("Campanha não encontrada!");
    }

    if (dto.name) {
      const existName = await prisma.campaign.findFirst({
        where: { accountId, id: { not: id }, name: dto.name },
        select: { id: true },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: "Já existe Campanha com esse nome",
        });
      }
    }

    await prisma.campaign.update({
      where: { id, accountId },
      data: { ...dto },
    });

    return { message: "OK.", status: 200 };
  }
}

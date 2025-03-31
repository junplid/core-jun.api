import { UpdateCampaignParameterDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateCampaignParameterUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateCampaignParameterDTO_I) {
    const exists = await prisma.campaignParameter.findFirst({
      where: { accountId, id },
    });

    if (!exists) {
      throw new ErrorResponse(400).toast({
        title: `Parâmetro não foi encontrado`,
        type: "error",
      });
    }

    try {
      const { timesWork, ...rest } = dto;
      const { RootCampaignParameterRangesConfig } =
        await prisma.campaignParameter.update({
          where: { accountId, id },
          data: {
            ...rest,
            ...((timesWork?.length || timesWork !== undefined) && {
              TimesWork: {
                deleteMany: { campaignParameterId: id },
                createMany: {
                  data: timesWork.map(({ id, ...t }) => ({
                    type: "campaign_parameter",
                    ...t,
                  })),
                },
              },
            }),
          },
          select: {
            RootCampaignParameterRangesConfig: {
              select: { name: true },
            },
          },
        });

      return {
        message: "OK!",
        status: 200,
        campaignParameter: {
          interval: RootCampaignParameterRangesConfig.name,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Erro ao tentar atualizar parâmetro`,
        type: "error",
      });
    }
  }
}

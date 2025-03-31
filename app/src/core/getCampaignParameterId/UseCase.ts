import { prisma } from "../../adapters/Prisma/client";
import { GetCampaignParameterIdDTO_I } from "./DTO";

export class GetCampaignParameterIdUseCase {
  constructor() {}

  async run(dto: GetCampaignParameterIdDTO_I) {
    const campaignParameter = await prisma.campaignParameter.findFirst({
      where: dto,
      select: {
        id: true,
        name: true,
        sendDuringHoliday: true,
        TimesWork: {
          select: { startTime: true, endTime: true, dayOfWeek: true, id: true },
        },
        RootCampaignParameterRangesConfig: { select: { id: true } },
      },
    });

    if (!campaignParameter) {
      return {
        message: "Parâmetro não encontrado!",
        statusCode: 200,
      };
    }

    const { RootCampaignParameterRangesConfig, TimesWork, ...rest } =
      campaignParameter;

    return {
      message: "OK!",
      status: 200,
      campaignParameter: {
        ...rest,
        timesWork: TimesWork,
        rangeId: RootCampaignParameterRangesConfig.id,
      },
    };
  }
}

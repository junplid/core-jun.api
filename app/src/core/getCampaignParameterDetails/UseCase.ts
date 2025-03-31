import { GetCampaignParameterDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetCampaignParameterDetailsUseCase {
  constructor() {}

  async run(dto: GetCampaignParameterDetailsDTO_I) {
    const paramss = await prisma.campaignParameter.findFirst({
      where: dto,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        sendDuringHoliday: true,
        updateAt: true,
        createAt: true,
        TimesWork: {
          select: { id: true, dayOfWeek: true, endTime: true, startTime: true },
        },
        RootCampaignParameterRangesConfig: {
          select: {
            name: true,
            amountShorts: true,
            timeForShorts: true,
            timeRest: true,
          },
        },
      },
    });

    if (!paramss) {
      throw new ErrorResponse(400).toast({
        title: `Parâmetro não foi encontrado!`,
        type: "error",
      });
    }

    const { RootCampaignParameterRangesConfig, TimesWork, ...params } = paramss;
    const cp = RootCampaignParameterRangesConfig;
    const daySeconds = 1000 * 60 * 60 * 24;
    const amountShortsDay = daySeconds / (cp.timeForShorts * 1000);
    const quantasVezesIraDescansarEmUmDia = amountShortsDay / cp.amountShorts;
    const totalTimeResting =
      quantasVezesIraDescansarEmUmDia * (cp.timeRest * 1000);
    const totalTimeWorking = Math.abs(totalTimeResting - daySeconds);
    const shotsPerDay = totalTimeWorking / (cp.timeForShorts * 1000);

    return {
      message: "OK!",
      status: 200,
      campaignParameter: {
        ...params,
        timesWork: TimesWork,
        range: { name: cp.name, shotsPerDay },
      },
    };
  }
}

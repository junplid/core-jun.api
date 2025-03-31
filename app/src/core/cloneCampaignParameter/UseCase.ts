import { CloneCampaignParameterDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneCampaignParameterUseCase {
  constructor() {}

  async run(dto: CloneCampaignParameterDTO_I) {
    const paramss = await prisma.campaignParameter.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        sendDuringHoliday: true,
        RootCampaignParameterRangesConfig: { select: { id: true, name: true } },
        TimesWork: {
          select: {
            dayOfWeek: true,
            endTime: true,
            startTime: true,
            type: true,
          },
        },
      },
    });

    if (!paramss) {
      throw new ErrorResponse(400).toast({
        title: "Parâmetro de campanha não encontrado!",
        type: "error",
      });
    }

    const {
      RootCampaignParameterRangesConfig: Root,
      TimesWork: Times,
      ...rest
    } = paramss;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedTag = await prisma.campaignParameter.create({
      data: {
        ...rest,
        name,
        accountId: dto.accountId,
        rootCampaignParameterRangesConfigId: Root.id,
        TimesWork: { createMany: { data: Times } },
      },
      select: { id: true, createAt: true },
    });

    const campaignParameter = { ...clonedTag, name, interval: Root.name };

    return {
      message: "Parâmetro clonado com sucesso!",
      status: 200,
      campaignParameter,
    };
  }
}

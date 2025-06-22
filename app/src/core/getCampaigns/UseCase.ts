import { GetCampaignsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { TypeStatusCampaign } from "@prisma/client";
import moment from "moment";

export class GetCampaignsUseCase {
  constructor() {}

  async run(dto: GetCampaignsDTO_I) {
    const findCampaigns = await prisma.campaign.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        name: true,
        id: true,
        status: true,
        CampaignOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
        FlowState: { select: { isFinish: true, isSent: true } },
        createAt: true,
      },
    });

    const campaigns = findCampaigns.map((campaign) => {
      const { CampaignOnBusiness, FlowState, ...rest } = campaign;
      const totalFlows = FlowState.length;
      const sentCount = FlowState.filter((fs) => fs.isSent).length;
      const finishCount = FlowState.filter((fs) => fs.isFinish).length;
      const sentPercentage =
        totalFlows > 0 ? (sentCount / totalFlows) * 100 : 0;
      const finishPercentage =
        totalFlows > 0 ? (finishCount / totalFlows) * 100 : 0;

      return {
        ...rest,
        businesses: CampaignOnBusiness.map((cb) => ({
          id: cb.Business.id,
          name: cb.Business.name,
        })),
        finishPercentage,
        sentPercentage,
        totalFlows,
      };
    });

    return {
      message: "OK!",
      status: 200,
      campaigns: [
        ...campaigns,
        {
          businesses: [{ id: 1, name: "" }],
          finishPercentage: 88,
          sentPercentage: 88,
          totalFlows: 133,
          id: 8,
          name: "[237] CAMPANHA academia - Pague 3 meses GANHE 1",
          status: "running",
          createAt: moment("2025-06-22").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 1, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 246,
          id: 7,
          name: "PROMOÇÃO de São João - 2025",
          status: "finished",
          createAt: moment("2025-06-21").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 1, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 34,
          id: 6,
          name: "Nova versão - Departamentos humanizados",
          status: "finished",
          createAt: moment("2025-06-19").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 1, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 23,
          id: 5,
          name: "Nova versão - Agente de inteligência artificial",
          status: "finished",
          createAt: moment("2025-06-13").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 2, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 180,
          id: 4,
          name: "Promoção Dia do Cliente - Desconto Especial",
          status: "finished",
          createAt: moment("2025-05-26").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 3, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 95,
          id: 3,
          name: "Campanha de Aniversário - Sorteio e Brindes",
          status: "finished",
          createAt: moment("2025-05-11").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 4, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 58,
          id: 2,
          name: "Black Friday antecipada - Até 60% OFF",
          status: "finished",
          createAt: moment("2025-05-06").startOf("day").toDate(),
        },
        {
          businesses: [{ id: 5, name: "" }],
          finishPercentage: 100,
          sentPercentage: 100,
          totalFlows: 42,
          id: 1,
          name: "Semana do Meio Ambiente - Conscientização",
          status: "finished",
          createAt: moment("2025-05-05").startOf("day").toDate(),
        },
      ],
    };
  }
}

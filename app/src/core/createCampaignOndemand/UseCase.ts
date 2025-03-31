import { CreateCampaignOndemandDTO_I } from "./DTO";
import { CreateCampaignOndemandRepository_I } from "./Repository";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateCampaignOndemandUseCase {
  constructor(private repository: CreateCampaignOndemandRepository_I) {}

  async run({ connectionOnBusinessIds, ...dto }: CreateCampaignOndemandDTO_I) {
    const campaignAlreadyExisting =
      await this.repository.fetchExistCampaignWithThisName({
        name: dto.name,
        accountId: dto.accountId,
        businessIds: dto.businessIds,
      });

    if (campaignAlreadyExisting) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe uma campanha com esse nome",
      });
    }

    const validConnections = await Promise.all(
      connectionOnBusinessIds.map(async (connectionOnBusinessId) => {
        const isValid = await this.repository.fetchExistConnectionOnBusiness({
          connectionOnBusinessId,
          accountId: dto.accountId,
        });
        return isValid ? connectionOnBusinessId : null;
      })
    );

    if (validConnections.includes(null)) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: "Há algumas conexões inválidas!",
      });
    }

    const connectionsBeingUsed =
      await this.repository.fetchCampaignOnConnections({
        accountId: dto.accountId,
        connectionOnBusinessIds: connectionOnBusinessIds,
      });

    if (connectionsBeingUsed) {
      throw new ErrorResponse(400).input({
        path: "connectionOnBusinessIds",
        text: "Algumas dessas conexões já estão sendo usadas!",
      });
    }

    const flowExist = await this.repository.fetchExistFlow({
      accountId: dto.accountId,
      flowId: dto.flowId,
    });

    if (!flowExist) {
      throw new ErrorResponse(400).input({
        path: "flowId",
        text: "Fluxo não encontrado",
      });
    }

    const { campaignOnBusinessIds, ...campaign } =
      await this.repository.createCampaignOndemand({
        ...dto,
      });

    (validConnections as number[]).forEach(async (connectionOnBusinessId) => {
      campaignOnBusinessIds.forEach((campaignOnBusinessId) => {
        this.repository.createConnectionOnCampaign({
          connectionOnBusinessId,
          campaignOnBusinessId,
        });
      });
    });

    return {
      message: "Campanha criada com sucesso!",
      status: 201,
      campaign: { ...campaign, status: "running" },
    };
  }
}

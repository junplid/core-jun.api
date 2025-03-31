import { CloneCampaignDTO_I } from "./DTO";
import { CloneCampaignRepository_I } from "./Repository";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneCampaignUseCase {
  constructor(private repository: CloneCampaignRepository_I) {}

  async run(dto: CloneCampaignDTO_I) {
    // const countResource = await prisma.campaign.count({
    //   where: { accountId: dto.accountId },
    // });
    // const assets = await prisma.account.findFirst({
    //   where: { id: dto.accountId },
    //   select: {
    //     Plan: {
    //       select: { PlanAssets: { select: { business: true } } },
    //     },
    //     AccountSubscriptions: {
    //       where: { dateOfCancellation: null },
    //       select: {
    //         type: true,
    //         subscriptionsId: true,
    //         PlanPeriods: {
    //           select: {
    //             Plan: {
    //               select: { PlanAssets: { select: { marketingSends: true } } },
    //             },
    //           },
    //         },
    //         ExtraPackage: {
    //           where: { type: "marketingSends" },
    //           select: { amount: true },
    //         },
    //       },
    //     },
    //   },
    // });
    // if (assets?.AccountSubscriptions.length) {
    //   const listExtraAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.ExtraPackage) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub) return (sub.ExtraPackage?.amount || 0) * -1;
    //       }
    //       return sub.ExtraPackage?.amount || 0;
    //     })
    //   );
    //   const totalAmountExtra = listExtraAmount.reduce(
    //     (prv, cur) => prv + cur,
    //     0
    //   );

    //   const listPlanAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.PlanPeriods) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub)
    //           return (sub.PlanPeriods.Plan.PlanAssets.marketingSends || 0) * -1;
    //       }
    //       return sub.PlanPeriods?.Plan.PlanAssets.marketingSends || 0;
    //     })
    //   );
    //   const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);

    //   const total = totalPlanExtra + totalAmountExtra;

    //   if (total + countResource >= 0) {
    //     throw new ErrorResponse(400).toast({
    //       title: "Limite de campanhas atingida. compre mais pacotes extra",
    // type: "error",
    //     });
    //   }
    // } else {
    //   if (assets?.Plan && countResource >= assets.Plan.PlanAssets.business) {
    //     throw new ErrorResponse(400).toast({
    //       title: "Limite de campanhas atingida. compre mais pacotes extra",
    // type: "error",
    //     });
    //   }
    // }

    const campaign = await prisma.campaign.findFirst({
      where: { ...dto, isOndemand: false },
      select: {
        description: true,
        name: true,
        flowId: true,
        CampaignOnBusiness: { select: { businessId: true } },
        AudienceOnCampaign: { select: { audienceId: true } },
        DenialCampaign: {
          select: {
            whoAnsweredConnection: true,
            whoHasTag: true,
            whoIsInCampaign: true,
            whoIsInFlow: true,
            whoReceivedMessageBefore: true,
          },
        },
        campaignParameterId: true,
      },
    });

    if (!campaign) {
      throw new ErrorResponse(400).toast({
        title: "Campanha não encontrada",
        type: "error",
      });
    }

    const name = `COPIA_${new Date().getTime()}_${campaign.name}`;

    const flowExist = await this.repository.fetchExistFlow({
      accountId: dto.accountId,
      flowId: campaign.flowId,
    });

    if (!flowExist) {
      throw new ErrorResponse(400).toast({
        title: "Fluxo não encontrado!",
        type: "error",
      });
    }

    const { campaignOnBusinessIds, ...campaign22 } =
      await this.repository.createCampaignOndemand({
        description: campaign.description || undefined,
        flowId: campaign.flowId,
        accountId: dto.accountId,
        businessIds: campaign.CampaignOnBusiness.map((s) => s.businessId),
        name,
        audienceIds: campaign.AudienceOnCampaign.map((s) => s.audienceId),
        DenialCampaign: campaign.DenialCampaign,
        campaignParameterId: campaign.campaignParameterId,
      });

    const contactsWAOnAccountOnAudienceIds =
      await this.repository.fetchAllContactsOfAudience(
        campaign.AudienceOnCampaign.map((s) => s.audienceId)
      );

    const newListContactsWAOnAccountOnAudienceIdsUnique: {
      id: number;
      completeNumber: string;
    }[] = [];

    contactsWAOnAccountOnAudienceIds.forEach(([{ completeNumber, id }]) => {
      const alreadyExists = newListContactsWAOnAccountOnAudienceIdsUnique.every(
        (ss) => ss.completeNumber !== completeNumber
      );
      if (alreadyExists) {
        newListContactsWAOnAccountOnAudienceIdsUnique.push({
          completeNumber,
          id,
        });
      }
    });

    await this.repository.createAudienceOnCampaign({
      campaignId: campaign22.id,
      contactsWAOnAccountOnAudienceIds:
        newListContactsWAOnAccountOnAudienceIdsUnique.map(({ id }) => id),
    });

    return {
      message: "Campanha clonada com sucesso!",
      status: 201,
      campaign: { ...campaign22, name, status: "stopped" },
    };
  }
}

import { CreateFlowRepository_I } from "./Repository";
import { CreateFlowDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateFlowUseCase {
  constructor(private repository: CreateFlowRepository_I) {}

  async run(dto: CreateFlowDTO_I) {
    const countResource = await ModelFlows.count({
      accountId: dto.accountId,
    });

    const assets = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: {
        Plan: {
          select: { PlanAssets: { select: { business: true } } },
        },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: { select: { PlanAssets: { select: { flow: true } } } },
              },
            },
            ExtraPackage: {
              where: { type: "flows" },
              select: { amount: true },
            },
          },
        },
      },
    });
    if (assets?.AccountSubscriptions.length) {
      const listExtraAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.ExtraPackage) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            if (!isValidSub) return (sub.ExtraPackage?.amount || 0) * -1;
          }
          return sub.ExtraPackage?.amount || 0;
        })
      );
      const totalAmountExtra = listExtraAmount.reduce(
        (prv, cur) => prv + cur,
        0
      );

      const listPlanAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.PlanPeriods) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            if (!isValidSub)
              return (sub.PlanPeriods.Plan.PlanAssets.flow || 0) * -1;
          }
          return sub.PlanPeriods?.Plan.PlanAssets.flow || 0;
        })
      );
      const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);

      const total = totalPlanExtra + totalAmountExtra;

      if (total - countResource <= 0) {
        throw new ErrorResponse(400).toast({
          title: "Limite de fluxos atingido. compre mais pacotes extra",
          type: "error",
        });
      }
    } else {
      if (assets?.Plan && countResource >= assets.Plan.PlanAssets.business) {
        throw new ErrorResponse(400).toast({
          title: "Limite de fluxos atingido. compre mais pacotes extra",
          type: "error",
        });
      }
    }

    const existName = await ModelFlows.count({
      name: dto.name,
      accountId: dto.accountId,
      businessIds: dto.businessIds,
    });

    if (existName) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe com esse nome",
      });
    }

    const { flowId } = await this.repository.create(dto);

    const businessNames = await this.repository.fetchBusiness({
      businessIds: dto.businessIds,
    });

    return {
      message: "OK!",
      status: 201,
      flowId,
      business: businessNames.join(", "),
    };
  }
}

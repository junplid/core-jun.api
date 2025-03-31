import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneFlowDTO_I } from "./DTO";

type TotalsAmountExtra = {
  [c in "flow"]?: number;
};

export class CreateCloneFlowUseCase {
  constructor() {}

  async run({ accountId, id: idOrigin }: CreateCloneFlowDTO_I) {
    const countResource = await ModelFlows.count({
      accountId: accountId,
    });

    const assets = await prisma.account.findFirst({
      where: { id: accountId },
      select: {
        Plan: { select: { PlanAssets: { select: { flow: true } } } },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: { PlanAssets: { select: { flow: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "flows" },
              select: { amount: true, type: true },
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
            const v = sub.ExtraPackage.amount || 0;
            if (!isValidSub) return { v: v * -1, type: sub.ExtraPackage.type };
            return { v, type: sub.ExtraPackage.type };
          }
        })
      );

      const totalsAmountExtra: TotalsAmountExtra = listExtraAmount.reduce(
        (acc: any, cur) => {
          if (cur) {
            if (!acc[cur.type]) acc[cur.type] = 0;
            acc[cur.type] += cur.v;
            return acc;
          }
        },
        {}
      );

      const listPlanAssetsAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.PlanPeriods) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            const planAssets = sub.PlanPeriods.Plan.PlanAssets;
            if (!isValidSub) {
              return { flow: (planAssets.flow || 0) * -1 };
            }
            return { flow: planAssets.flow || 0 };
          }
          0;
        })
      );

      const totalsAmountPlanAssets = listPlanAssetsAmount.reduce(
        (acc, curr) => {
          return {
            flow: (acc?.flow || 0) + (curr?.flow || 0),
          };
        },
        { flow: 0 }
      );

      const flows =
        (totalsAmountPlanAssets?.flow || 0) + (totalsAmountExtra.flow || 0);

      const rest = flows - countResource;

      if (rest > 0) {
        const flow = await ModelFlows.findOne({
          accountId,
          _id: idOrigin,
        });

        if (flow) {
          try {
            let nextId: null | number = null;
            const maxIdDocument = await ModelFlows.findOne(
              {},
              {},
              { sort: { _id: -1 } }
            );
            if (maxIdDocument) {
              nextId = maxIdDocument._id + 1;
            }
            const name = flow.name + "_COPIA_" + new Date().getTime();
            await ModelFlows.create({
              _id: nextId ?? 1,
              type: flow.type,
              businessIds: flow.businessIds,
              accountId,
              name: flow.name + "_COPIA_" + new Date().getTime(),
              data: flow.data,
            });
            const b = await prisma.business.findMany({
              where: { id: { in: flow.businessIds } },
              select: { name: true },
            });
            const listBuss = b.map((bv) => bv.name);
            return {
              message: "OK!",
              status: 200,
              flow: {
                name,
                id: nextId ?? 1,
                type: flow.type,
                business: listBuss.join(", "),
              },
            };
          } catch (error) {
            throw new ErrorResponse(400).toast({
              title: "Erro ao tentar clonar fluxo",
              type: "error",
            });
          }
        }
      }
    } else {
      if (assets?.Plan) {
        const rest = assets.Plan.PlanAssets.flow - countResource;

        if (rest > 0) {
          const flow = await ModelFlows.findOne({
            accountId,
            _id: idOrigin,
          });

          if (flow) {
            try {
              let nextId: null | number = null;
              const maxIdDocument = await ModelFlows.findOne(
                {},
                {},
                { sort: { _id: -1 } }
              );
              if (maxIdDocument) {
                nextId = maxIdDocument._id + 1;
              }
              const name = flow.name + "_COPIA_" + new Date().getTime();
              await ModelFlows.create({
                _id: nextId ?? 1,
                type: flow.type,
                businessIds: flow.businessIds,
                accountId,
                name: flow.name + "_COPIA_" + new Date().getTime(),
                data: flow.data,
              });
              const b = await prisma.business.findMany({
                where: { id: { in: flow.businessIds } },
                select: { name: true },
              });
              const listBuss = b.map((bv) => bv.name);
              return {
                message: "OK!",
                status: 200,
                flow: {
                  name,
                  id: nextId ?? 1,
                  type: flow.type,
                  business: listBuss.join(", "),
                },
              };
            } catch (error) {
              throw new ErrorResponse(400).toast({
                title: "Erro ao tentar clonar fluxo",
                type: "error",
              });
            }
          } else {
            throw new ErrorResponse(400).toast({
              title: "Fluxo não encontrado",
              type: "error",
            });
          }
        } else {
          throw new ErrorResponse(400).toast({
            title: "Limite de fluxos atingido. compre mais pacotes extra",
            type: "error",
          });
        }
      } else {
        throw new ErrorResponse(400).toast({
          title:
            "Seu plano não foi encontrado. Solicite o nosso suporte para resolver seu problema",
          type: "error",
        });
      }
    }
  }
}

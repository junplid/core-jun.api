import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneConnectionWaDTO_I } from "./DTO";

type TotalsAmountExtra = {
  [c in "connections"]?: number;
};

export class CreateCloneConnectionWaUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: CreateCloneConnectionWaDTO_I) {
    const assets = await prisma.account.findFirst({
      where: { id: accountId },
      select: {
        Plan: { select: { PlanAssets: { select: { connections: true } } } },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: { PlanAssets: { select: { connections: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "connections" },
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
              return { connections: (planAssets.connections || 0) * -1 };
            }
            return { connections: planAssets.connections || 0 };
          }
          0;
        })
      );

      const totalsAmountPlanAssets = listPlanAssetsAmount.reduce(
        (acc, curr) => {
          return {
            connections: (acc?.connections || 0) + (curr?.connections || 0),
          };
        },
        { connections: 0 }
      );

      const connections =
        (totalsAmountPlanAssets?.connections || 0) +
        (totalsAmountExtra?.connections || 0);

      const countResource = await prisma.connectionOnBusiness.count({
        where: { Business: { accountId } },
      });

      const rest = connections - countResource;

      if (rest > 0) {
        const connection = await prisma.connectionOnBusiness.findUnique({
          where: { id, Business: { accountId } },
          select: {
            name: true,
            type: true,
            ConnectionConfig: true,
            businessId: true,
          },
        });

        if (connection) {
          const { ConnectionConfig, ...con } = connection;

          const { Business, ...nextConnection } =
            await prisma.connectionOnBusiness.create({
              data: {
                ...con,
                name: con.name + "_COPIA_" + new Date().getTime(),
                ...(ConnectionConfig && {
                  ConnectionConfig: {
                    create: ConnectionConfig,
                  },
                }),
              },
              select: {
                name: true,
                id: true,
                type: true,
                createAt: true,
                Business: { select: { name: true } },
              },
            });

          return {
            message: "OK!",
            status: 200,
            connection: { ...nextConnection, business: Business.name },
          };
        } else {
          throw new ErrorResponse(400).toast({
            title:
              "Não é possível clonar, pois o limite de conexões foi excedida.",
            type: "error",
          });
        }
      } else {
        throw new ErrorResponse(400).toast({
          title:
            "Não é possível clonar, pois o limite de conexões foi excedida.",
          type: "error",
        });
      }
    } else {
      if (assets?.Plan) {
        const countResource = await prisma.connectionOnBusiness.count({
          where: { Business: { accountId } },
        });

        const rest = assets.Plan.PlanAssets.connections - countResource;

        if (rest > 0) {
          const connection = await prisma.connectionOnBusiness.findUnique({
            where: { id, Business: { accountId } },
            select: {
              name: true,
              type: true,
              ConnectionConfig: true,
              businessId: true,
            },
          });

          if (connection) {
            const { ConnectionConfig, ...con } = connection;

            const { Business, ...nextConnection } =
              await prisma.connectionOnBusiness.create({
                data: {
                  ...con,
                  name: con.name + "_COPIA_" + new Date().getTime(),
                  ...(ConnectionConfig && {
                    ConnectionConfig: {
                      create: ConnectionConfig,
                    },
                  }),
                },
                select: {
                  name: true,
                  id: true,
                  type: true,
                  createAt: true,
                  Business: { select: { name: true } },
                },
              });

            return {
              message: "OK!",
              status: 200,
              connection: { ...nextConnection, business: Business.name },
            };
          } else {
            throw new ErrorResponse(400).toast({
              title: "Conexão não encontrada",
              type: "error",
            });
          }
        } else {
          throw new ErrorResponse(400).toast({
            title:
              "Não é possível clonar, pois o limite de conexões foi excedida.",
            type: "error",
          });
        }
      } else {
        throw new ErrorResponse(400).toast({
          title:
            "Plano não encontrado. Entre em contato com o suporte para resolver o problema.",
          type: "error",
        });
      }
    }
  }
}

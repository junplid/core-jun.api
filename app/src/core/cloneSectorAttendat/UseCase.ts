import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneSectorAttendantDTO_I } from "./DTO";

type TotalsAmountExtra = {
  [c in "attendants"]?: number;
};

export class CreateCloneSectorAttendantUseCase {
  constructor() {}

  async run({ accountId, id }: CreateCloneSectorAttendantDTO_I) {
    const assets = await prisma.account.findFirst({
      where: { id: accountId },
      select: {
        Plan: { select: { PlanAssets: { select: { attendants: true } } } },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: { PlanAssets: { select: { attendants: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "attendants" },
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
              return { attendants: (planAssets.attendants || 0) * -1 };
            }
            return { attendants: planAssets.attendants || 0 };
          }
          0;
        })
      );

      const totalsAmountPlanAssets = listPlanAssetsAmount.reduce(
        (acc, curr) => {
          return {
            attendants: (acc?.attendants || 0) + (curr?.attendants || 0),
          };
        },
        { attendants: 0 }
      );

      const attendants =
        (totalsAmountPlanAssets?.attendants || 0) +
        (totalsAmountExtra.attendants || 0);

      const countResource = await prisma.sectorsAttendants.count({
        where: { accountId },
      });

      const rest = attendants - countResource;

      if (rest > 0) {
        const oldAttendant = await prisma.sectorsAttendants.findUnique({
          where: { id, accountId },
        });

        if (oldAttendant) {
          const {
            interrupted,
            createAt,
            updateAt,
            id,
            imageName,
            username,
            ...rest
          } = oldAttendant;
          const { Business, Sectors, ...restNew } =
            await prisma.sectorsAttendants.create({
              data: {
                ...rest,
                username: `COPIA_${new Date().getTime()}_${username}`,
                name: oldAttendant.name + "_COPIA_" + new Date().getTime(),
              },
              select: {
                name: true,
                id: true,
                createAt: true,
                Business: { select: { name: true } },
                Sectors: { select: { name: true } },
              },
            });

          return {
            message: "OK!",
            status: 200,
            sectorsAttendants: {
              ...restNew,
              business: Business.name,
              sectorName: Sectors?.name,
            },
          };
        } else {
          throw new ErrorResponse(400).toast({
            title: "Atendente não encontrado",
            type: "error",
          });
        }
      } else {
        throw new ErrorResponse(400).toast({
          title: "Limite de atendentes atingido. compre mais pacotes extra",
          type: "error",
        });
      }
    } else {
      if (assets?.Plan) {
        const countResource = await prisma.sectorsAttendants.count({
          where: { accountId },
        });

        const rest = assets.Plan.PlanAssets.attendants - countResource;

        if (rest > 0) {
          const oldAttendant = await prisma.sectorsAttendants.findUnique({
            where: { id, accountId },
          });

          if (oldAttendant) {
            const {
              interrupted,
              createAt,
              updateAt,
              id,
              imageName,
              username,
              ...rest
            } = oldAttendant;
            const { Business, Sectors, ...restNew } =
              await prisma.sectorsAttendants.create({
                data: {
                  ...rest,
                  username: `COPIA_${new Date().getTime()}_${username}`,
                  name: oldAttendant.name + "_COPIA_" + new Date().getTime(),
                },
                select: {
                  name: true,
                  id: true,
                  createAt: true,
                  status: true,
                  Business: { select: { name: true } },
                  Sectors: { select: { name: true } },
                },
              });
            return {
              message: "OK!",
              status: 200,
              sectorsAttendants: {
                ...restNew,
                business: Business.name,
                sectorName: Sectors?.name,
              },
            };
          } else {
            throw new ErrorResponse(400).toast({
              title: "Atendente não encontrado",
              type: "error",
            });
          }
        } else {
          throw new ErrorResponse(400).toast({
            title: "Limite de conexões atingido. compre mais pacotes extra",
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

import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateSectorAttendantDTO_I } from "./DTO";
import { CreateSectorAttendantRepository_I } from "./Repository";

export class CreateSectorAttendantUseCase {
  constructor(private repository: CreateSectorAttendantRepository_I) {}

  async run(dto: CreateSectorAttendantDTO_I) {
    const countResource = await prisma.sectorsAttendants.count({
      where: { accountId: dto.accountId },
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
                Plan: {
                  select: { PlanAssets: { select: { attendants: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "attendants" },
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
              return (sub.PlanPeriods.Plan.PlanAssets.attendants || 0) * -1;
          }
          return sub.PlanPeriods?.Plan.PlanAssets.attendants || 0;
        })
      );
      const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);

      const total = totalPlanExtra + totalAmountExtra;

      if (total - countResource <= 0) {
        throw new ErrorResponse(400).toast({
          title: `Limite de atendentes atingido. compre mais pacotes extra`,
          type: "error",
        });
      }
    } else {
      if (assets?.Plan && countResource >= assets.Plan.PlanAssets.business) {
        throw new ErrorResponse(400).toast({
          title: `Limite de atendentes atingido. compre mais pacotes extra`,
          type: "error",
        });
      }
    }

    const isAlreadyExists = await this.repository.fetchAlreadyExists({
      accountId: dto.accountId,
      username: dto.username,
    });

    if (isAlreadyExists) {
      throw new ErrorResponse(400).input({
        path: "username",
        text: `Já existe Atendente com esse usuário`,
      });
    }

    const { Business, Sectors, ...data } =
      await prisma.sectorsAttendants.create({
        data: { ...dto, status: !!dto.status },
        select: {
          createAt: true,
          id: true,
          Business: { select: { name: true } },
          Sectors: { select: { name: true } },
        },
      });

    return {
      message: "OK!",
      status: 201,
      sectorAttendant: {
        ...data,
        business: Business.name,
        sectorName: Sectors?.name ?? "",
      },
    };
  }
}

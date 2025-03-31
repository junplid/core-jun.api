import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateSubAccountDTO_I } from "./DTO";
import { CreateSubAccountRepository_I } from "./Repository";

import { genSalt, hash } from "bcrypt";

export class CreateSubAccountUseCase {
  constructor(private repository: CreateSubAccountRepository_I) {}

  async run(dto: CreateSubAccountDTO_I) {
    const countResource = await prisma.subAccount.count({
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
                  select: { PlanAssets: { select: { users: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "users" },
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
              return (sub.PlanPeriods.Plan.PlanAssets.users || 0) * -1;
          }
          return sub.PlanPeriods?.Plan.PlanAssets.users || 0;
        })
      );
      const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);

      const total = totalPlanExtra + totalAmountExtra;

      if (total - countResource <= 0) {
        throw new ErrorResponse(400).toast({
          title: `Limite de usuarios atingido. compre mais pacotes extra`,
          type: "error",
        });
      }
    } else {
      if (assets?.Plan && countResource >= assets.Plan.PlanAssets.business) {
        throw new ErrorResponse(400).toast({
          title: `Limite de usuarios atingido. compre mais pacotes extra`,
          type: "error",
        });
      }
    }

    const alreadyExist = await this.repository.fetchAlreadyExist({
      accountId: dto.accountId,
      email: dto.email,
    });

    if (alreadyExist) {
      throw new ErrorResponse(400).input({
        path: "email",
        text: `Já existe um usuário com essa email cadastrado`,
      });
    }

    const salt = await genSalt(6);
    const password = await hash(dto.password, salt);

    const { accountId, createAt } = await this.repository.create({
      ...dto,
      password,
    });

    return {
      message: "Usuario criado com sucesso!",
      status: 201,
      user: { id: accountId, createAt },
    };
  }
}
